import crypto from 'crypto';
import { getPlatformConfig, getBaseCallbackUrl } from './config';
import { StoredOAuthTokens, SupportedSocialPlatform } from './types';

// In-memory token vault with fallback for active session lifecycle
const tokenStore = new Map<string, StoredOAuthTokens>();
const stateStore = new Map<string, { platform: SupportedSocialPlatform; userId: string; codeVerifier?: string; timestamp: number }>();

function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateCodeChallenge(verifier: string): string {
  return base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());
}

/**
 * Generate official platform authorization URL with PKCE (for X) and state protection
 */
export function buildAuthorizationUrl(
  platform: SupportedSocialPlatform,
  userId: string,
  host?: string
): { url: string; state: string; error?: string } {
  const config = getPlatformConfig(platform);
  const clientId = process.env[config.clientIdEnv];

  if (!clientId) {
    return {
      url: '',
      state: '',
      error: `Missing environment variable ${config.clientIdEnv} for ${config.displayName}. Please configure developer credentials in Settings or .env.`
    };
  }

  const state = `${platform}_${generateRandomString(16)}`;
  const redirectUri = `${getBaseCallbackUrl(host)}/${platform}`;

  let codeVerifier: string | undefined;
  let codeChallenge: string | undefined;

  if (platform === 'x') {
    codeVerifier = generateRandomString(32);
    codeChallenge = generateCodeChallenge(codeVerifier);
  }

  stateStore.set(state, {
    platform,
    userId,
    codeVerifier,
    timestamp: Date.now()
  });

  const urlParams = new URLSearchParams();

  switch (platform) {
    case 'instagram':
    case 'facebook':
      urlParams.append('client_id', clientId);
      urlParams.append('redirect_uri', redirectUri);
      urlParams.append('scope', config.requiredScopes.join(','));
      urlParams.append('response_type', 'code');
      urlParams.append('state', state);
      break;

    case 'youtube':
      urlParams.append('client_id', clientId);
      urlParams.append('redirect_uri', redirectUri);
      urlParams.append('response_type', 'code');
      urlParams.append('scope', config.requiredScopes.join(' '));
      urlParams.append('access_type', 'offline'); // To receive a refresh_token
      urlParams.append('prompt', 'consent');
      urlParams.append('state', state);
      break;

    case 'tiktok':
      urlParams.append('client_key', clientId);
      urlParams.append('scope', config.requiredScopes.join(','));
      urlParams.append('response_type', 'code');
      urlParams.append('redirect_uri', redirectUri);
      urlParams.append('state', state);
      break;

    case 'x':
      urlParams.append('response_type', 'code');
      urlParams.append('client_id', clientId);
      urlParams.append('redirect_uri', redirectUri);
      urlParams.append('scope', config.requiredScopes.join(' '));
      urlParams.append('state', state);
      if (codeChallenge) {
        urlParams.append('code_challenge', codeChallenge);
        urlParams.append('code_challenge_method', 'S256');
      }
      break;

    case 'linkedin':
      urlParams.append('response_type', 'code');
      urlParams.append('client_id', clientId);
      urlParams.append('redirect_uri', redirectUri);
      urlParams.append('state', state);
      urlParams.append('scope', config.requiredScopes.join(' '));
      break;
  }

  return {
    url: `${config.authUrl}?${urlParams.toString()}`,
    state
  };
}

/**
 * Validate incoming OAuth state and return session context
 */
export function validateOAuthState(state: string): { platform: SupportedSocialPlatform; userId: string; codeVerifier?: string } | null {
  const item = stateStore.get(state);
  if (!item) return null;

  // Expire state after 15 minutes
  if (Date.now() - item.timestamp > 15 * 60 * 1000) {
    stateStore.delete(state);
    return null;
  }

  stateStore.delete(state);
  return item;
}

/**
 * Exchange official authorization code for access & refresh tokens
 */
export async function exchangeAuthorizationCode(
  platform: SupportedSocialPlatform,
  code: string,
  userId: string,
  codeVerifier?: string,
  host?: string
): Promise<{ success: boolean; tokens?: StoredOAuthTokens; error?: string }> {
  const config = getPlatformConfig(platform);
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    return {
      success: false,
      error: `Missing API credentials for ${config.displayName}. Check ${config.clientIdEnv} and ${config.clientSecretEnv}.`
    };
  }

  const redirectUri = `${getBaseCallbackUrl(host)}/${platform}`;

  try {
    let tokenResponse: any;

    if (platform === 'instagram' || platform === 'facebook') {
      const tokenUrl = `${config.tokenUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
      const res = await fetch(tokenUrl);
      tokenResponse = await res.json();
      
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error.message || 'Meta OAuth token exchange failed');
      }

      // Exchange short-lived token for long-lived 60-day token
      const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenResponse.access_token}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();
      if (longLivedData.access_token) {
        tokenResponse = longLivedData;
      }
    } else if (platform === 'youtube') {
      const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      tokenResponse = await res.json();
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error_description || tokenResponse.error || 'Google OAuth exchange failed');
      }
    } else if (platform === 'tiktok') {
      const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });
      tokenResponse = await res.json();
      if (tokenResponse.error || tokenResponse.data?.error_code) {
        throw new Error(tokenResponse.data?.error_description || tokenResponse.error || 'TikTok token exchange failed');
      }
      // Normalize tiktok payload
      if (tokenResponse.data) {
        tokenResponse = tokenResponse.data;
      }
    } else if (platform === 'x') {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier || ''
      });

      const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`
        },
        body: params
      });
      tokenResponse = await res.json();
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error_description || tokenResponse.error || 'X (Twitter) OAuth exchange failed');
      }
    } else if (platform === 'linkedin') {
      const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        })
      });
      tokenResponse = await res.json();
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error_description || tokenResponse.error || 'LinkedIn token exchange failed');
      }
    }

    const expiresInSeconds = tokenResponse.expires_in || 3600 * 24 * 30; // default 30 days if unspecified
    const tokens: StoredOAuthTokens = {
      platform,
      userId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type || 'Bearer',
      expiresAt: Date.now() + expiresInSeconds * 1000,
      scope: tokenResponse.scope || config.requiredScopes.join(' '),
      platformUserId: tokenResponse.open_id || tokenResponse.user_id || 'verified_user',
      connectedAt: new Date().toISOString()
    };

    // Store in vault
    const storeKey = `${userId}_${platform}`;
    tokenStore.set(storeKey, tokens);

    return {
      success: true,
      tokens
    };
  } catch (err: any) {
    console.error(`[OAuth Exchange Error][${platform}]:`, err);
    return {
      success: false,
      error: err.message || `Failed to exchange authorization code with ${config.displayName}`
    };
  }
}

/**
 * Retrieve securely stored access token for a user's platform, auto-refreshing if expired or near expiry
 */
export async function getStoredToken(userId: string, platform: SupportedSocialPlatform): Promise<StoredOAuthTokens | null> {
  const storeKey = `${userId}_${platform}`;
  const token = tokenStore.get(storeKey);
  if (!token) return null;

  // If token expires in less than 5 minutes, attempt automatic refresh
  const bufferMs = 5 * 60 * 1000;
  if (Date.now() + bufferMs >= token.expiresAt) {
    if (token.refreshToken || platform === 'instagram' || platform === 'facebook') {
      const refreshed = await refreshOAuthToken(userId, platform);
      if (refreshed.success && refreshed.tokens) {
        return refreshed.tokens;
      }
    }
    // If expired and cannot refresh, return null
    if (Date.now() >= token.expiresAt) {
      return null;
    }
  }
  return token;
}

/**
 * Synchronously check stored token without making network refresh calls
 */
export function getStoredTokenSync(userId: string, platform: SupportedSocialPlatform): StoredOAuthTokens | null {
  const storeKey = `${userId}_${platform}`;
  const token = tokenStore.get(storeKey);
  if (!token) return null;
  if (Date.now() >= token.expiresAt) return null;
  return token;
}

/**
 * Refresh expired or expiring OAuth token using official platform endpoints
 */
export async function refreshOAuthToken(
  userId: string,
  platform: SupportedSocialPlatform
): Promise<{ success: boolean; tokens?: StoredOAuthTokens; error?: string }> {
  const storeKey = `${userId}_${platform}`;
  const currentTokens = tokenStore.get(storeKey);
  const config = getPlatformConfig(platform);
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!currentTokens) {
    return { success: false, error: `No stored tokens found for ${platform}` };
  }

  if (!clientId || !clientSecret) {
    return { success: false, error: `Missing API credentials for ${config.displayName}` };
  }

  try {
    let newTokenResponse: any = null;

    if (platform === 'youtube') {
      if (!currentTokens.refreshToken) {
        throw new Error('No refresh token available for Google/YouTube. Re-authentication required.');
      }
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: currentTokens.refreshToken,
          grant_type: 'refresh_token'
        })
      });
      newTokenResponse = await res.json();
      if (newTokenResponse.error) {
        throw new Error(newTokenResponse.error_description || newTokenResponse.error || 'YouTube token refresh failed');
      }
    } else if (platform === 'instagram' || platform === 'facebook') {
      // Meta token extension for long-lived tokens
      const extendUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${currentTokens.accessToken}`;
      const res = await fetch(extendUrl);
      newTokenResponse = await res.json();
      if (newTokenResponse.error) {
        throw new Error(newTokenResponse.error.message || 'Meta token extension failed');
      }
    } else if (platform === 'x') {
      if (!currentTokens.refreshToken) {
        throw new Error('No refresh token for X (Twitter).');
      }
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: currentTokens.refreshToken,
          client_id: clientId
        })
      });
      newTokenResponse = await res.json();
      if (newTokenResponse.error) {
        throw new Error(newTokenResponse.error_description || 'X token refresh failed');
      }
    }

    const expiresInSeconds = newTokenResponse.expires_in || 3600 * 24 * 30;
    const updatedTokens: StoredOAuthTokens = {
      ...currentTokens,
      accessToken: newTokenResponse.access_token,
      refreshToken: newTokenResponse.refresh_token || currentTokens.refreshToken,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      connectedAt: new Date().toISOString()
    };

    tokenStore.set(storeKey, updatedTokens);
    return { success: true, tokens: updatedTokens };
  } catch (err: any) {
    console.error(`[Token Refresh Error][${platform}]:`, err);
    return { success: false, error: err.message || `Failed to refresh token for ${config.displayName}` };
  }
}

/**
 * Set token directly (used when bootstrapping or restoring from encrypted storage)
 */
export function saveTokenDirectly(tokens: StoredOAuthTokens) {
  const storeKey = `${tokens.userId}_${tokens.platform}`;
  tokenStore.set(storeKey, tokens);
}

/**
 * Disconnect account and revoke tokens
 */
export async function disconnectPlatform(
  userId: string, 
  platform: SupportedSocialPlatform
): Promise<{ success: boolean; message: string }> {
  const storeKey = `${userId}_${platform}`;
  const token = tokenStore.get(storeKey);
  const config = getPlatformConfig(platform);

  if (token && config.revokeUrl) {
    try {
      if (platform === 'youtube') {
        await fetch(`${config.revokeUrl}?token=${token.accessToken}`, { method: 'POST' });
      } else if (platform === 'instagram' || platform === 'facebook') {
        await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${token.accessToken}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn(`[Revocation warning for ${platform}]:`, e);
    }
  }

  tokenStore.delete(storeKey);
  return {
    success: true,
    message: `Disconnected ${config.displayName} and revoked stored credentials.`
  };
}

/**
 * List connection states across all 6 supported platforms for a user
 */
export function getUserConnectionsSummary(userId: string): Record<SupportedSocialPlatform, {
  connected: boolean;
  configured: boolean;
  expiresAt?: number;
  lastSynced?: string;
  scope?: string;
}> {
  const platforms: SupportedSocialPlatform[] = ['instagram', 'tiktok', 'youtube', 'x', 'facebook', 'linkedin'];
  const summary: any = {};

  for (const p of platforms) {
    const config = getPlatformConfig(p);
    const configured = Boolean(process.env[config.clientIdEnv] && process.env[config.clientSecretEnv]);
    const token = tokenStore.get(`${userId}_${p}`);
    const isTokenValid = token ? Date.now() < token.expiresAt : false;

    summary[p] = {
      connected: isTokenValid,
      configured,
      expiresAt: token?.expiresAt,
      lastSynced: token?.connectedAt,
      scope: token?.scope
    };
  }

  return summary;
}
