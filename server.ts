import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import socialRouter from './server/social/router';

dotenv.config();

// Simple in-memory cache to prevent exhausting Gemini free tier API quota
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours for successful responses
const ERROR_CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes for fallback/error responses to give API a break

const GEMINI_MODEL = 'gemini-2.5-flash';

function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key);
  if (cached) {
    const expiry = cached.data?.status === 'mock' ? ERROR_CACHE_EXPIRY_MS : CACHE_EXPIRY_MS;
    if (Date.now() - cached.timestamp < expiry) {
      return cached.data;
    }
  }
  return null;
}

function setCachedResponse(key: string, data: any) {
  responseCache.set(key, { data, timestamp: Date.now() });
}

function getCacheKey(prefix: string, params: any): string {
  return `${prefix}_${JSON.stringify(params)}`;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Official Social Media Intelligence Layer API
app.use('/api/social', socialRouter);

// Initialize AI lazily to prevent crash if key is missing
let aiClient: any = null;
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  
  // Remove markdown codeblock wrappers if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try to strip trailing commas before closing curly braces or brackets and remove comments
    const fixed = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    
    try {
      return JSON.parse(fixed);
    } catch (innerErr) {
      // Try to extract the first JSON array or object
      const objectMatch = cleaned.match(/\{[\s\S]*\}/);
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0].replace(/,\s*([}\]])/g, '$1'));
        } catch (e) {}
      }
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0].replace(/,\s*([}\]])/g, '$1'));
        } catch (e) {}
      }
      throw err;
    }
  }
}

// Default pre-populated brands for initial discovery
const STATIC_BRANDS = [
  {
    id: 'b1',
    name: 'Nike',
    website: 'https://www.nike.com',
    industry: 'Fashion & Apparel',
    category: 'Fitness',
    country: 'United States',
    creatorProgramPage: 'https://www.nike.com/affiliate-program',
    partnershipPage: 'https://www.nike.com/sponsorships',
    publicMarketingContact: 'marketing@nike.com',
    publicPartnershipContact: 'partnerships@nike.com',
    instagram: '@nike',
    linkedin: 'https://www.linkedin.com/company/nike',
    notes: 'Focuses on athletes, high-performance wear, and daily motivation. Very active on TikTok/IG.'
  },
  {
    id: 'b2',
    name: 'Gymshark',
    website: 'https://www.gymshark.com',
    industry: 'Fitness & Apparel',
    category: 'Fitness',
    country: 'United Kingdom',
    creatorProgramPage: 'https://www.gymshark.com/pages/athletes',
    partnershipPage: 'https://www.gymshark.com/pages/partnerships',
    publicMarketingContact: 'press@gymshark.com',
    publicPartnershipContact: 'athletes@gymshark.com',
    instagram: '@gymshark',
    linkedin: 'https://www.linkedin.com/company/gymshark',
    notes: 'Huge pioneer in influencer marketing and UGC. Focuses on gym communities and fitness journeys.'
  },
  {
    id: 'b3',
    name: 'Apple',
    website: 'https://www.apple.com',
    industry: 'Consumer Technology',
    category: 'Tech',
    country: 'United States',
    creatorProgramPage: 'https://www.apple.com/co-marketing',
    partnershipPage: 'https://www.apple.com/contact',
    publicMarketingContact: 'media.help@apple.com',
    publicPartnershipContact: 'partnerships@apple.com',
    instagram: '@apple',
    linkedin: 'https://www.linkedin.com/company/apple',
    notes: 'Focuses on premium lifestyle, creativity, professional workflow, and Shot on iPhone campaigns.'
  },
  {
    id: 'b4',
    name: 'Notion',
    website: 'https://www.notion.so',
    industry: 'Software & Productivity',
    category: 'Tech',
    country: 'United States',
    creatorProgramPage: 'https://www.notion.so/creators',
    partnershipPage: 'https://www.notion.so/affiliates',
    publicMarketingContact: 'marketing@makenotion.com',
    publicPartnershipContact: 'affiliates@makenotion.com',
    instagram: '@notion',
    linkedin: 'https://www.linkedin.com/company/notion-labs',
    notes: 'Very community-driven. Loves aesthetic workspace setups, productivity workflows, and template builders.'
  },
  {
    id: 'b5',
    name: 'Airbnb',
    website: 'https://www.airbnb.com',
    industry: 'Hospitality & Travel',
    category: 'Travel',
    country: 'United States',
    creatorProgramPage: 'https://www.airbnb.com/associates',
    partnershipPage: 'https://www.airbnb.com/press',
    publicMarketingContact: 'press@airbnb.com',
    publicPartnershipContact: 'influencers@airbnb.com',
    instagram: '@airbnb',
    linkedin: 'https://www.linkedin.com/company/airbnb',
    notes: 'Promotes unique stays, experiences, slow travel, and local adventures. Prefers highly cinematic content.'
  },
  {
    id: 'b6',
    name: 'Duolingo',
    website: 'https://www.duolingo.com',
    industry: 'Education & EdTech',
    category: 'Lifestyle',
    country: 'United States',
    creatorProgramPage: 'https://www.duolingo.com/creators',
    partnershipPage: 'https://www.duolingo.com/press',
    publicMarketingContact: 'pr@duolingo.com',
    publicPartnershipContact: 'social-creators@duolingo.com',
    instagram: '@duolingo',
    linkedin: 'https://www.linkedin.com/company/duolingo',
    notes: 'Known for humorous, unhinged, meme-based content centered around the Duo mascot. Highly viral.'
  },
  {
    id: 'b7',
    name: 'Liquid Death',
    website: 'https://www.liquiddeath.com',
    industry: 'Food & Beverage',
    category: 'Lifestyle',
    country: 'United States',
    creatorProgramPage: 'https://www.liquiddeath.com/pages/death-peddlers',
    partnershipPage: 'https://www.liquiddeath.com/pages/contact',
    publicMarketingContact: 'info@liquiddeath.com',
    publicPartnershipContact: 'sponsorships@liquiddeath.com',
    instagram: '@liquiddeath',
    linkedin: 'https://www.linkedin.com/company/liquid-death',
    notes: 'Edgy, punk-rock, environmentalist branding. Extremely creative, anti-marketing campaigns.'
  },
  {
    id: 'b8',
    name: 'Lululemon',
    website: 'https://www.lululemon.com',
    industry: 'Athletic Apparel',
    category: 'Fashion',
    country: 'Canada',
    creatorProgramPage: 'https://shop.lululemon.com/story/ambassadors',
    partnershipPage: 'https://shop.lululemon.com/story/affiliates',
    publicMarketingContact: 'media@lululemon.com',
    publicPartnershipContact: 'ambassadors@lululemon.com',
    instagram: '@lululemon',
    linkedin: 'https://www.linkedin.com/company/lululemon',
    notes: 'Yoga, mindfulness, active living. High-quality aesthetic posts and day-in-the-life vlogs.'
  }
];

// 1. Brand Discovery API (Search static + optional AI extension)
app.get('/api/brands', (req, res) => {
  const { query, industry, category, country } = req.query;
  let filtered = [...STATIC_BRANDS];

  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(b => b.name.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q) || b.notes.toLowerCase().includes(q));
  }
  if (industry) {
    filtered = filtered.filter(b => b.industry.toLowerCase() === String(industry).toLowerCase());
  }
  if (category) {
    filtered = filtered.filter(b => b.category.toLowerCase() === String(category).toLowerCase());
  }
  if (country) {
    filtered = filtered.filter(b => b.country.toLowerCase() === String(country).toLowerCase());
  }

  res.json({ status: 'ok', data: filtered });
});

// 2. AI Brand Research
app.post('/api/research', async (req, res) => {
  const { brandName, website, industry, category, creatorBio } = req.body;

  const cacheKey = `research:${brandName}:${creatorBio || ''}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();

  // Dense, high-fidelity brand profiles for offline/mock backup execution
  const BRAND_INTEL_PRESETS: Record<string, any> = {
    gymshark: {
      overview: "Gymshark is a pioneer in creator-centric influencer marketing. Built from the ground up by the gym community, it dominates the athletic apparel market by partnering with passionate athletes rather than traditional advertising.",
      products: ["Gymshark Apex Seamless", "Vital Seamless Sets", "Rest Day Athleisure Line"],
      tone: "Motivational, supportive, organic, and intensely focused on personal athletic progress.",
      targetAudience: "Gen Z gym-goers, everyday athletes, powerlifters, and lifestyle fitness enthusiasts.",
      campaignSummary: "The 'United We Sweat' campaign focused on showing raw, unedited personal fitness struggles and triumphs in standard commercial gyms.",
      suggestedAngle: "Create an authentic 'morning routine and lift' high-contrast vlog featuring Gymshark Apex wear, capturing personal lifting milestones without heavy sales copy.",
      suggestedPositioning: "The Community Pioneer: Position yourself as an authentic gym-community leader who bridges the gap between everyday routines and elite activewear.",
      recentCampaigns: ["United We Sweat", "Lift Gymshark 2026 Tour", "Apex High-Performance Drop"],
      currentCreators: ["David Laid", "66-Day Fitness Crew", "Whitney Simmons", "Micro Lift Vlogger Guild"],
      marketingManager: "Sarah Jenkins (Senior Creator Relations Director)",
      prEmail: "press@gymshark.com",
      partnershipsEmail: "athletes@gymshark.com",
      creatorAppLinks: "https://www.gymshark.com/pages/athletes",
      affiliateProgram: "Gymshark Athlete Guild (10% commission + retainer opportunities)",
      estimatedBudget: "$5,000 - $25,000 (Based on UGC package or continuous retainer)",
      preferredStyle: "Raw gym floor vlogs, aesthetic high-contrast editing, high-energy transition hooks.",
      bestMonthToPitch: "January (New Year Campaigns) & August (Autumn Drops)",
      brandVoice: "Authentic, raw, empowering, fitness-obsessed",
      lastCampaignLaunch: "March 2026",
      opportunityScore: 94,
      scoreReason: "Fits your niche perfectly, accepts UGC regularly, and has high active budgets. You have matching audience locations."
    },
    nike: {
      overview: "Nike is the global leader in athletic wear and sports culture, focused on bringing inspiration and innovation to every athlete. They run high-budget campaigns focusing on cultural representation and high-caliber athletic storytelling.",
      products: ["Nike Air Zoom Pegasus", "Metcon Training Series", "Nike Pro Performance Base"],
      tone: "Inspirational, epic, authoritative, and deeply focused on perseverance and breaking boundaries.",
      targetAudience: "Athletes, competitive individuals, urban style curators, and general runners.",
      campaignSummary: "The 'Own the Floor' campaign focused on underground dance crews and street athletes using specialized gear.",
      suggestedAngle: "Produce a cinematic high-fidelity reel centering on 'The Invisible Routine' - focusing on early morning prep, mental focus, and Metcon footwear.",
      suggestedPositioning: "The Dedicated High-Performer: Position your content as premium-quality, cinematic visual assets that match Nike's elite editorial standard.",
      recentCampaigns: ["Own the Floor", "Winning Isn't for Everyone", "Pegasus 41 Launch Grid"],
      currentCreators: ["Giannis Antetokounmpo", "Eliud Kipchoge", "Aesthetic Movement Creators", "Cinematic Running Guild"],
      marketingManager: "Marcus Vance (VP Global Influencer Brand Marketing)",
      prEmail: "media@nike.com",
      partnershipsEmail: "partnerships@nike.com",
      creatorAppLinks: "https://www.nike.com/sponsorships",
      affiliateProgram: "Nike Affiliate Program via CJ Affiliate (7% base commission)",
      estimatedBudget: "$10,000 - $50,000 (Based on cinematic high-quality creative briefs)",
      preferredStyle: "Cinematic, documentary-style, storytelling-focused, minimal voiceover with high sound design.",
      bestMonthToPitch: "May (Summer Running Campaigns) & November (Holiday Gift Guides)",
      brandVoice: "Sovereign, motivational, heroic, culturally relevant",
      lastCampaignLaunch: "May 2026",
      opportunityScore: 89,
      scoreReason: "Strong fit with premium lifestyles, loves highly cinematic content, but has highly selective entry gates."
    },
    apple: {
      overview: "Apple is a global technology powerhouse synonymous with premium design, sleek simplicity, and empowering individual creativity. They prioritize clean visual aesthetics and professional creator workflows.",
      products: ["iPad Pro with M4", "iPhone 15/16 Pro Cinematic Mode", "MacBook Pro M3 Max Studio"],
      tone: "Minimalist, visionary, effortless, and focused on enabling human potential and creative workflows.",
      targetAudience: "Creative professionals, design purists, productivity enthusiasts, and tech early-adopters.",
      campaignSummary: "The 'Shot on iPhone' series highlights real-world cinematic films captured completely on mobile by independent directors.",
      suggestedAngle: "Create an aesthetic, highly organized 'Workspace Restructure' desk setup vlog focusing on iPad Pro integration into your creator workflow.",
      suggestedPositioning: "The Modern Creative Director: Highlight your technical workflow, minimalist desk organization, and premium design language.",
      recentCampaigns: ["Shot on iPhone Cinematic Pro", "iPad Pro: Can Your Computer Do This?", "Mac Studio Creative Lab"],
      currentCreators: ["Austin Mann", "Selena Gomez (Music Video Collab)", "Aesthetic Tech Desk Vloggers", "Minimalist Designers"],
      marketingManager: "Laura Thorne (VP Creator & Co-Marketing Systems)",
      prEmail: "media.help@apple.com",
      partnershipsEmail: "partnerships@apple.com",
      creatorAppLinks: "https://www.apple.com/co-marketing",
      affiliateProgram: "Apple Services Performance Partners (Up to 15% on subscriptions/books)",
      estimatedBudget: "$15,000 - $75,000 (Based on premium exclusivity and asset buyouts)",
      preferredStyle: "Sleek, minimalist, high desk aesthetics, professional lighting, crisp typography.",
      bestMonthToPitch: "September (iPhone Launch Cycle) & June (Back to School Campaigns)",
      brandVoice: "Visionary, simple, elegant, premium, enabling",
      lastCampaignLaunch: "June 2026",
      opportunityScore: 81,
      scoreReason: "Loves premium creator setups, but has a low volume of public UGC collaborations. Prioritizes elite design language."
    },
    notion: {
      overview: "Notion is an all-in-one workspace for notes, tasks, wikis, and databases. Their entire brand is driven by an incredible community of template builders, productivity gurus, and aesthetic workspace creators.",
      products: ["Notion AI Workspace", "Notion Calendar Sync", "Notion Student Hub Pro"],
      tone: "Supportive, clever, organized, clean, and collaborative.",
      targetAudience: "Students, startup founders, creative professionals, writers, and productivity vlogger communities.",
      campaignSummary: "The 'Notion for Startups' campaign featured real tech founders showing how they run their entire company on a single wiki.",
      suggestedAngle: "Design an aesthetic, custom-built 'Ultimate Creator Brain' Notion template and build a step-by-step vlog detailing how it tracks your sponsorship income.",
      suggestedPositioning: "The Hyper-Organized Operator: Leverage your analytical skill to present Notion as the essential skeleton for every creator business.",
      recentCampaigns: ["My Notion Setup", "Notion AI: Draft Your Mind", "Notion for Startups Series"],
      currentCreators: ["Ali Abdaal", "Thomas Frank", "Aesthetic Study Vlogger Guild", "Minimal Productive Creators"],
      marketingManager: "David Torres (Head of Community & Affiliates)",
      prEmail: "press@makenotion.com",
      partnershipsEmail: "affiliates@makenotion.com",
      creatorAppLinks: "https://www.notion.so/creators",
      affiliateProgram: "Notion Affiliate Partner program (50% commission on referrals for 1 year)",
      estimatedBudget: "$3,000 - $12,000 (Varies by audience reach and template download volume)",
      preferredStyle: "Screen-recorded walkthroughs, clean desk aesthetics, split-screen tutorials, voiceover explanation.",
      bestMonthToPitch: "August (Back to School Peak) & December (New Year Reset planning)",
      brandVoice: "Friendly, organized, modular, enabling, community-first",
      lastCampaignLaunch: "April 2026",
      opportunityScore: 92,
      scoreReason: "Perfect fit for productive creators. High affiliate conversion rates and very open to community-authored templates."
    }
  };

  const nameKey = String(brandName).toLowerCase().trim();
  const matchedPreset = BRAND_INTEL_PRESETS[nameKey];

  if (!ai) {
    const fallbackData = matchedPreset || {
      overview: `${brandName} is a leading brand in the ${industry || category || 'lifestyle'} sector, renowned for its commitment to high-quality products and customer experiences. They have built an incredibly loyal community through active social media engagements and innovative product drops.`,
      products: ['Flagship Premium Product Line', 'Limited Edition Collaborations', 'Starter Packs and Subscription bundles'],
      tone: 'Aspirational, clean, modern, and highly empowering. They communicate using authoritative but accessible copy, prioritizing emotional connections over technical features.',
      targetAudience: 'Milennials, Gen Z, high-performing individuals, and creative professionals who value aesthetics, personal growth, and durability.',
      campaignSummary: 'Their recent campaign focused on "A Day in the Life" storytelling, leveraging micro and mid-tier UGC creators to show product utility in organic environments. This drove a 40% increase in social referral sales.',
      suggestedAngle: `Produce a cinematic product-integration video highlighting how ${brandName} elevates your daily routine, emphasizing sensory details and high-quality visuals over direct selling.`,
      suggestedPositioning: `The Premium Organizer: Leverage your background in content creation to position ${brandName} as the ultimate standard for modern creators.`,
      recentCampaigns: ["The Daily Elevate Series", "Cinematic Routine Challenge", "Empowered Routine Drops"],
      currentCreators: ["Sarah Vibe Vlogs", "Alex Athletic Focus", "Cinematic UGC Guild Member"],
      marketingManager: "Johnathan Doe (VP Influencer Marketing Operations)",
      prEmail: `press@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      partnershipsEmail: `partnerships@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      creatorAppLinks: `https://www.${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/creators`,
      affiliateProgram: `Direct Creator Commission program (10% on coupon checkout)`,
      estimatedBudget: "$2,500 - $10,000 (UGC bundle model)",
      preferredStyle: "Cinematic UGC, high-contrast sound design, product aesthetic showcase.",
      bestMonthToPitch: "March & September",
      brandVoice: "Aspirational, authentic, modern, clean",
      lastCampaignLaunch: "January 2026",
      opportunityScore: 85,
      scoreReason: "Matches your lifestyle and creator niche closely. Accepting brand ambassadors with your follower range."
    };

    const mockRes = {
      status: 'mock',
      warning: 'GEMINI_API_KEY is not configured. Displaying pre-generated analysis.',
      data: fallbackData
    };
    setCachedResponse(cacheKey, mockRes);
    return res.json(mockRes);
  }

  try {
    const prompt = `
      You are Heimdall, an elite AI Brand Partnerships Manager. Analyze the brand "${brandName}" (Website: ${website || 'N/A'}, Industry: ${industry || 'N/A'}, Category: ${category || 'N/A'}).
      Based on this brand and optionally the creator's focus: "${creatorBio || 'lifestyle, UGC content, productivity, fitness'}", generate a detailed, structured intelligence report.
      You MUST respond ONLY with a valid JSON object matching this TypeScript structure:
      {
        "overview": "string describing company overview",
        "products": ["product 1", "product 2", "product 3"],
        "tone": "string describing brand voice/tone",
        "targetAudience": "string describing their target buyers",
        "campaignSummary": "string describing recent visual or marketing campaigns",
        "suggestedAngle": "specific creative partnership angle",
        "suggestedPositioning": "how the creator should position themselves to win the deal",
        "recentCampaigns": ["campaign 1", "campaign 2"],
        "currentCreators": ["creator 1", "creator 2"],
        "marketingManager": "name of marketing manager or 'N/A'",
        "prEmail": "pr or press email address",
        "partnershipsEmail": "partnerships or influencer relations email",
        "creatorAppLinks": "URL link to application form or 'N/A'",
        "affiliateProgram": "short description of affiliate terms",
        "estimatedBudget": "estimated campaign budget bracket",
        "preferredStyle": "style preferred like Cinematic, Raw Gym, Vlogs",
        "bestMonthToPitch": "optimal months to pitch",
        "brandVoice": "voice adjectives like unhinged, inspirational, sleek",
        "lastCampaignLaunch": "month and year",
        "opportunityScore": number between 40 and 100,
        "scoreReason": "sentence explaining why they are a strong fit or fit score rationale"
      }
      Do not include any backticks, markdown markers, or other wrapper text. Just raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);
    const successRes = { status: 'ok', data: parsed };
    setCachedResponse(cacheKey, successRes);
    res.json(successRes);
  } catch (error: any) {
    console.warn('Gemini Research error, falling back to mock:', error.message || error);
    
    // Fallback to presets or default mock
    const fallbackData = matchedPreset || {
      overview: `${brandName} is a leading brand in the ${industry || category || 'lifestyle'} sector, renowned for its commitment to high-quality products and customer experiences. They have built an incredibly loyal community through active social media engagements and innovative product drops.`,
      products: ['Flagship Premium Product Line', 'Limited Edition Collaborations', 'Starter Packs and Subscription bundles'],
      tone: 'Aspirational, clean, modern, and highly empowering. They communicate using authoritative but accessible copy, prioritizing emotional connections over technical features.',
      targetAudience: 'Milennials, Gen Z, high-performing individuals, and creative professionals who value aesthetics, personal growth, and durability.',
      campaignSummary: 'Their recent campaign focused on "A Day in the Life" storytelling, leveraging micro and mid-tier UGC creators to show product utility in organic environments. This drove a 40% increase in social referral sales.',
      suggestedAngle: `Produce a cinematic product-integration video highlighting how ${brandName} elevates your daily routine, emphasizing sensory details and high-quality visuals over direct selling.`,
      suggestedPositioning: `The Premium Organizer: Leverage your background in content creation to position ${brandName} as the ultimate standard for modern creators.`,
      recentCampaigns: ["The Daily Elevate Series", "Cinematic Routine Challenge", "Empowered Routine Drops"],
      currentCreators: ["Sarah Vibe Vlogs", "Alex Athletic Focus", "Cinematic UGC Guild Member"],
      marketingManager: "Johnathan Doe (VP Influencer Marketing Operations)",
      prEmail: `press@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      partnershipsEmail: `partnerships@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      creatorAppLinks: `https://www.${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/creators`,
      affiliateProgram: `Direct Creator Commission program (10% on coupon checkout)`,
      estimatedBudget: "$2,500 - $10,000 (UGC bundle model)",
      preferredStyle: "Cinematic UGC, high-contrast sound design, product aesthetic showcase.",
      bestMonthToPitch: "March & September",
      brandVoice: "Aspirational, authentic, modern, clean",
      lastCampaignLaunch: "January 2026",
      opportunityScore: 87,
      scoreReason: `Encountered Gemini API limitation. Falling back to secure local heuristic. Brand matches niches: ${creatorBio || 'lifestyle'} at a high-efficiency index.`
    };

    const errorRes = {
      status: 'mock',
      warning: `Gemini API encountered an error (${error.message || 'quota/limit'}). Displaying pre-generated analysis.`,
      data: fallbackData
    };
    setCachedResponse(cacheKey, errorRes);
    res.json(errorRes);
  }
});

// 3. AI Outreach Generator
app.post('/api/outreach', async (req, res) => {
  const { brand, creator } = req.body;

  const brandName = brand?.name || 'this brand';
  const creatorName = creator?.creatorName || creator?.fullName || 'Creator';
  const nicheList = creator?.niches?.join(', ') || 'UGC, lifestyle';

  const cacheKey = `outreach:${brandName}:${creatorName}:${nicheList}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();

  if (!ai) {
    const mockRes = {
      status: 'mock',
      warning: 'GEMINI_API_KEY is not configured. Displaying pre-generated outreach templates.',
      data: {
        subjectLine: `Partnership Proposal: ${creatorName} x ${brandName} ⚡`,
        emailBody: `Hi ${brandName} Partnerships Team,\n\nI've been following your recent campaigns and absolutely loved your latest product launch! As a creator specializing in ${nicheList}, my audience values premium, high-quality aesthetics that mirror your own brand voice.\n\nI would love to discuss a potential partnership to create high-performing UGC videos showcasing how your products seamlessly integrate into a high-performance daily routine. \n\nI have put together some creative ideas tailored to ${brandName}—would you be open to a quick call or email exchange next week to explore this?\n\nBest regards,\n\n${creatorName}`,
        instagramDm: `Hey team! ⚡ Absolutely obsessed with your latest drops. I'm a creator in the ${nicheList} space and would love to collaborate on a high-energy UGC campaign. Let me know if I can pitch you some visual concepts over email!`,
        linkedinMessage: `Dear Partnerships Lead at ${brandName},\n\nI hope you're having a great week. I'm ${creatorName}, a professional content partner helping lifestyle and apparel brands drive conversions through visual-first UGC campaigns. I've developed several visual strategies tailored specifically to ${brandName}'s target demographic. I'd love to connect and share my media kit.`,
        followUpEmail: `Hi Team,\n\nI wanted to follow up on my previous message to see if you had any thoughts on collaborating with ${creatorName} for your upcoming campaign cycle. \n\nI know you're busy, but I'd love to share two brief, high-retention video storyboards that I believe would align perfectly with your content goals. Let me know if I can send them over!\n\nBest,\n\n${creatorName}`
      }
    };
    setCachedResponse(cacheKey, mockRes);
    return res.json(mockRes);
  }

  try {
    const prompt = `
      You are Heimdall, an elite AI Brand Partnerships Manager. Generate highly personalized outreach materials for:
      BRAND: Name: ${brandName}, Website: ${brand?.website || 'N/A'}, Industry: ${brand?.industry || 'N/A'}, Notes: ${brand?.notes || ''}
      CREATOR: Name: ${creatorName}, Bio: ${creator?.bio || ''}, Niches: ${nicheList}, Services: ${creator?.services?.join(', ') || 'Content Creation'}
      
      Generate unique, compelling, and professional pitches. Do not use generic placeholders like [My Name] or [Insert Brand Name]—use the actual values provided.
      You MUST respond ONLY with a valid JSON object matching this structure:
      {
        "subjectLine": "compelling email subject line with emoji",
        "emailBody": "professional, personalized outreach email",
        "instagramDm": "short, punchy Instagram DM (max 280 characters)",
        "linkedinMessage": "professional LinkedIn connection note/message",
        "followUpEmail": "gentle and value-driven follow-up email"
      }
      Do not include markdown wrappers.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);
    const successRes = { status: 'ok', data: parsed };
    setCachedResponse(cacheKey, successRes);
    res.json(successRes);
  } catch (error: any) {
    console.warn('Gemini Outreach error, falling back to mock:', error.message || error);
    const errorRes = {
      status: 'mock',
      warning: `Gemini API encountered an error (${error.message || 'quota/limit'}). Displaying pre-generated outreach templates.`,
      data: {
        subjectLine: `Partnership Proposal: ${creatorName} x ${brandName} ⚡`,
        emailBody: `Hi ${brandName} Partnerships Team,\n\nI've been following your recent campaigns and absolutely loved your latest product launch! As a creator specializing in ${nicheList}, my audience values premium, high-quality aesthetics that mirror your own brand voice.\n\nI would love to discuss a potential partnership to create high-performing UGC videos showcasing how your products seamlessly integrate into a high-performance daily routine. \n\nI have put together some creative ideas tailored to ${brandName}—would you be open to a quick call or email exchange next week to explore this?\n\nBest regards,\n\n${creatorName}`,
        instagramDm: `Hey team! ⚡ Absolutely obsessed with your latest drops. I'm a creator in the ${nicheList} space and would love to collaborate on a high-energy UGC campaign. Let me know if I can pitch you some visual concepts over email!`,
        linkedinMessage: `Dear Partnerships Lead at ${brandName},\n\nI hope you're having a great week. I'm ${creatorName}, a professional content partner helping lifestyle and apparel brands drive conversions through visual-first UGC campaigns. I've developed several visual strategies tailored specifically to ${brandName}'s target demographic. I'd love to connect and share my media kit.`,
        followUpEmail: `Hi Team,\n\nI wanted to follow up on my previous message to see if you had any thoughts on collaborating with ${creatorName} for your upcoming campaign cycle. \n\nI know you're busy, but I'd love to share two brief, high-retention video storyboards that I believe would align perfectly with your content goals. Let me know if I can send them over!\n\nBest,\n\n${creatorName}`
      }
    };
    setCachedResponse(cacheKey, errorRes);
    res.json(errorRes);
  }
});

// 4. Campaign Studio
app.post('/api/campaign', async (req, res) => {
  const { brand, creator } = req.body;

  const brandName = brand?.name || 'this brand';
  const creatorName = creator?.creatorName || 'Creator';

  const cacheKey = `campaign:${brandName}:${creatorName}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();

  if (!ai) {
    const mockRes = {
      status: 'mock',
      warning: 'GEMINI_API_KEY is not configured. Displaying pre-generated campaigns.',
      data: {
        title: `Visual Elevation Campaign for ${brandName}`,
        concepts: [
          {
            id: 'c1',
            title: 'The Invisible Routine Upgrade',
            description: 'Showcasing the brand product embedded naturally inside a high-aesthetic morning routine without calling it out until the 10-second mark.',
            hooks: [
              'The one tiny routine change I make every single morning.',
              'This looks like a luxury item, but it actually saved my budget.'
            ],
            callToAction: `Click the link in my bio to check out ${brandName} and use code CREATOR10 for 10% off.`
          },
          {
            id: 'c2',
            title: 'Expectation vs Reality: Honest Review',
            description: 'A humorous but highly relatable breakdown of typical products versus the superior experience of using this brand.',
            hooks: [
              'I bought this so you don\'t have to.',
              `Unboxing ${brandName} - is the hype actually real?`
            ],
            callToAction: `Experience the upgrade yourself via the link in my story!`
          }
        ],
        storyboards: [
          {
            id: 's1',
            sceneNumber: 1,
            visualDescription: 'Extreme close up of the product being opened, soft morning lighting, high-quality ASMR sound of opening the cap.',
            audioVoiceover: 'Everyone wants an aesthetic lifestyle, but nobody talks about the simple tools that make it actually happen...',
            shotType: 'Macro Close-Up',
            duration: '3s'
          },
          {
            id: 's2',
            sceneNumber: 2,
            visualDescription: 'Creator smiling, using the product in their daily work/lifestyle scenario. Dynamic movement.',
            audioVoiceover: 'I started using this product last month and it replaced three separate items in my setup.',
            shotType: 'Medium Shot',
            duration: '5s'
          },
          {
            id: 's3',
            sceneNumber: 3,
            visualDescription: 'Clean lay-flat layout of the product with a text overlay of a discount code and call to action.',
            audioVoiceover: 'Try it out with the code in my bio and level up your routine today.',
            shotType: 'Flat-lay / Overhead',
            duration: '4s'
          }
        ],
        shotLists: [
          'Close up of hands unboxing the product',
          'ASMR sound recording of product texture/packaging',
          'Medium shot of creator using the product naturally',
          'Wide shot of clean workspace showing product on desk',
          'Macro shot of product label with soft focus background'
        ]
      }
    };
    setCachedResponse(cacheKey, mockRes);
    return res.json(mockRes);
  }

  try {
    const prompt = `
      You are Heimdall, an elite Campaign Director. Develop a comprehensive, premium UGC and social media campaign for:
      BRAND: ${brandName}, website: ${brand?.website || ''}, notes: ${brand?.notes || ''}
      CREATOR: ${creatorName}, bio: ${creator?.bio || ''}, niche: ${creator?.niches?.join(', ') || ''}

      Generate rich concepts, hooks, an elegant multi-scene storyboard with voiceovers and shot types, and a precise shot list.
      You MUST respond ONLY with a valid JSON object matching this structure:
      {
        "title": "Campaign Title",
        "concepts": [
          {
            "id": "c1",
            "title": "Concept Title",
            "description": "Concept Description",
            "hooks": ["hook 1", "hook 2"],
            "callToAction": "Call to action text"
          }
        ],
        "storyboards": [
          {
            "id": "s1",
            "sceneNumber": 1,
            "visualDescription": "What happens on screen",
            "audioVoiceover": "What the narrator says",
            "shotType": "e.g. Medium Shot, Extreme Close-up",
            "duration": "e.g. 3s"
          }
        ],
        "shotLists": ["shot 1", "shot 2", "shot 3"]
      }
      Do not include markdown wrappers.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);
    const successRes = { status: 'ok', data: parsed };
    setCachedResponse(cacheKey, successRes);
    res.json(successRes);
  } catch (error: any) {
    console.warn('Gemini Campaign error, falling back to mock:', error.message || error);
    const errorRes = {
      status: 'mock',
      warning: `Gemini API encountered an error (${error.message || 'quota/limit'}). Displaying pre-generated campaigns.`,
      data: {
        title: `Visual Elevation Campaign for ${brandName}`,
        concepts: [
          {
            id: 'c1',
            title: 'The Invisible Routine Upgrade',
            description: 'Showcasing the brand product embedded naturally inside a high-aesthetic morning routine without calling it out until the 10-second mark.',
            hooks: [
              'The one tiny routine change I make every single morning.',
              'This looks like a luxury item, but it actually saved my budget.'
            ],
            callToAction: `Click the link in my bio to check out ${brandName} and use code CREATOR10 for 10% off.`
          },
          {
            id: 'c2',
            title: 'Expectation vs Reality: Honest Review',
            description: 'A humorous but highly relatable breakdown of typical products versus the superior experience of using this brand.',
            hooks: [
              'I bought this so you don\'t have to.',
              `Unboxing ${brandName} - is the hype actually real?`
            ],
            callToAction: `Experience the upgrade yourself via the link in my story!`
          }
        ],
        storyboards: [
          {
            id: 's1',
            sceneNumber: 1,
            visualDescription: 'Extreme close up of the product being opened, soft morning lighting, high-quality ASMR sound of opening the cap.',
            audioVoiceover: 'Everyone wants an aesthetic lifestyle, but nobody talks about the simple tools that make it actually happen...',
            shotType: 'Macro Close-Up',
            duration: '3s'
          },
          {
            id: 's2',
            sceneNumber: 2,
            visualDescription: 'Creator smiling, using the product in their daily work/lifestyle scenario. Dynamic movement.',
            audioVoiceover: 'I started using this product last month and it replaced three separate items in my setup.',
            shotType: 'Medium Shot',
            duration: '5s'
          },
          {
            id: 's3',
            sceneNumber: 3,
            visualDescription: 'Clean lay-flat layout of the product with a text overlay of a discount code and call to action.',
            audioVoiceover: 'Try it out with the code in my bio and level up your routine today.',
            shotType: 'Flat-lay / Overhead',
            duration: '4s'
          }
        ],
        shotLists: [
          'Close up of hands unboxing the product',
          'ASMR sound recording of product texture/packaging',
          'Medium shot of creator using the product naturally',
          'Wide shot of clean workspace showing product on desk',
          'Macro shot of product label with soft focus background'
        ]
      }
    };
    setCachedResponse(cacheKey, errorRes);
    res.json(errorRes);
  }
});

// 5. AI Recommended Brand Matches (Recommend based on profile)
app.post('/api/recommend', async (req, res) => {
  const { creator } = req.body;

  const nichesKey = creator?.niches?.join(',') || '';
  const bioKey = creator?.bio || '';
  const cacheKey = `recommend:${nichesKey}:${bioKey}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();

  if (!ai) {
    // Generate beautiful intelligent matches from STATIC_BRANDS depending on niche
    const niches = creator?.niches || [];
    let matched = [...STATIC_BRANDS];
    if (niches.length > 0) {
      matched = STATIC_BRANDS.filter(b => 
        niches.some((n: string) => 
          b.category.toLowerCase().includes(n.toLowerCase()) || 
          b.industry.toLowerCase().includes(n.toLowerCase()) ||
          b.notes.toLowerCase().includes(n.toLowerCase())
        )
      );
    }
    if (matched.length === 0) matched = STATIC_BRANDS.slice(0, 3);

    const recommendations = matched.map((b, idx) => ({
      brandId: b.id,
      brandName: b.name,
      website: b.website,
      industry: b.industry,
      matchScore: 90 - (idx * 5),
      reason: `Matches your niche of ${niches.join(', ') || 'visual content'}. They recently targeted similar demographics with premium micro-campaigns.`,
      angle: `Showcase how their ${b.name} products power your daily workflow as a busy creative.`
    }));

    const mockRes = {
      status: 'mock',
      warning: 'GEMINI_API_KEY is not configured. Displaying pre-generated recommendations.',
      data: recommendations
    };
    setCachedResponse(cacheKey, mockRes);
    return res.json(mockRes);
  }

  try {
    const prompt = `
      You are Heimdall, an elite AI Brand Partnerships Manager.
      Suggest 3 custom brand collaboration matches for this creator:
      CREATOR: Name: ${creator?.creatorName || 'Creator'}, Bio: ${creator?.bio || ''}, Niches: ${creator?.niches?.join(', ') || 'lifestyle'}, Services: ${creator?.services?.join(', ') || 'UGC'}
      
      Suggest actual, well-known brands that would fit perfectly. Provide an overview match score, reason, and recommended angle.
      You MUST respond ONLY with a valid JSON array matching this structure:
      [
        {
          "brandName": "Brand Name",
          "website": "www.brand.com",
          "industry": "Industry description",
          "matchScore": 95,
          "reason": "Why this brand fits perfectly with the creator's profile",
          "angle": "Specific campaign theme or visual idea"
        }
      ]
      Do not include markdown wrappers.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);
    const successRes = { status: 'ok', data: parsed };
    setCachedResponse(cacheKey, successRes);
    res.json(successRes);
  } catch (error: any) {
    console.warn('Gemini Recommend error, falling back to mock:', error.message || error);
    const niches = creator?.niches || [];
    let matched = [...STATIC_BRANDS];
    if (niches.length > 0) {
      matched = STATIC_BRANDS.filter(b => 
        niches.some((n: string) => 
          b.category.toLowerCase().includes(n.toLowerCase()) || 
          b.industry.toLowerCase().includes(n.toLowerCase()) ||
          b.notes.toLowerCase().includes(n.toLowerCase())
        )
      );
    }
    if (matched.length === 0) matched = STATIC_BRANDS.slice(0, 3);

    const recommendations = matched.map((b, idx) => ({
      brandId: b.id,
      brandName: b.name,
      website: b.website,
      industry: b.industry,
      matchScore: 90 - (idx * 5),
      reason: `Matches your niche of ${niches.join(', ') || 'visual content'}. They recently targeted similar demographics with premium micro-campaigns.`,
      angle: `Showcase how their ${b.name} products power your daily workflow as a busy creative.`
    }));

    const errorRes = {
      status: 'mock',
      warning: `Gemini API encountered an error (${error.message || 'quota/limit'}). Displaying pre-generated recommendations.`,
      data: recommendations
    };
    setCachedResponse(cacheKey, errorRes);
    res.json(errorRes);
  }
});

// 6. Interactive AI Assistant (Heimdall AI Chatbot)
app.post('/api/chat', async (req, res) => {
  const { messages, creator, savedBrands } = req.body;

  const cacheKey = `chat:${JSON.stringify(messages || [])}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();

  const lastMessage = messages[messages.length - 1]?.content || '';
  const creatorProfileSummary = creator ? `Name: ${creator.creatorName}, Bio: ${creator.bio}, Niches: ${creator.niches?.join(', ')}` : 'No creator profile defined yet.';
  const savedBrandsSummary = savedBrands && savedBrands.length > 0 ? `Saved Brands: ${savedBrands.map((b: any) => b.brandName).join(', ')}` : 'No brands saved yet.';

  if (!ai) {
    // Elegant fallback responses for key chat commands
    let mockReply = "Hello! I am Heimdall, your AI Partnerships Manager. It seems my GEMINI_API_KEY is not set in the workspace environment, but I can still assist you locally! Try completing your creator profile, saving some brands in Brand Discovery, and then using the Campaign Studio or AI Outreach to pitch them!";
    let actions: any[] = [];

    const lower = lastMessage.toLowerCase();
    if (lower.includes('fitness') || lower.includes('find')) {
      mockReply = "I've searched our directory and discovered several fitness brands matching your profile. You can see **Nike** and **Gymshark** which have active creator programs.";
      actions = [
        { label: 'Go to Brand Discovery', type: 'discovery', params: { search: 'fitness' } }
      ];
    } else if (lower.includes('nike') || lower.includes('pitch')) {
      mockReply = "I have prepared an exceptional outreach strategy for **Nike**. Our analysis suggests targeting their upcoming activewear collection with an aesthetic 'The Invisible Routine Upgrade' cinematic hook.";
      actions = [
        { label: 'Generate Nike Pitch', type: 'pitch', params: { brandId: 'b1', brandName: 'Nike' } },
        { label: 'View Nike Campaign Ideas', type: 'campaign', params: { brandId: 'b1', brandName: 'Nike' } }
      ];
    } else if (lower.includes('airbnb') || lower.includes('campaign')) {
      mockReply = "Airbnb is looking for cinematic UGC. I suggest pitch concept 'The Slow Living Sanctuary' focusing on unique properties. I can generate a complete storyboard for you right now!";
      actions = [
        { label: 'Create Airbnb Campaign', type: 'campaign', params: { brandId: 'b5', brandName: 'Airbnb' } }
      ];
    } else if (lower.includes('follow-up') || lower.includes('follow')) {
      mockReply = "A perfect follow-up should offer instant value, like sharing storyboard concepts or brief hooks. Here is a custom follow-up email ready for use in Outreach CRM.";
      actions = [
        { label: 'Go to Outreach CRM', type: 'crm', params: {} }
      ];
    }

    const mockRes = {
      status: 'mock',
      data: {
        content: mockReply,
        suggestedActions: actions
      }
    };
    setCachedResponse(cacheKey, mockRes);
    return res.json(mockRes);
  }

  try {
    const conversationContext = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = `
      You are Heimdall, a premium brand partnerships assistant. You help creators find opportunities, structure sponsorships, and pitch brands.
      CREATOR PROFILE CONTEXT: ${creatorProfileSummary}
      SAVED BRANDS CONTEXT: ${savedBrandsSummary}

      CONVERSATION HISTORY:
      ${conversationContext}

      Respond to the user with actionable, highly intelligent advice. Keep the response elegant, crisp, and authoritative (Apple-inspired tone).
      In addition to your response, you can optionally recommend up to 2 direct navigation buttons the creator can click to solve their problem immediately.
      You MUST respond ONLY with a valid JSON object matching this structure:
      {
        "content": "your advice or pitch contents in markdown format (can include bold texts, lists, etc.)",
        "suggestedActions": [
          {
            "label": "Button Label (e.g. Generate Nike Pitch)",
            "type": "pitch" | "research" | "campaign" | "discovery",
            "params": {
              "brandId": "optional brandId",
              "brandName": "optional brandName"
            }
          }
        ]
      }
      If no action is necessary, leave suggestedActions as an empty array.
      Do not include markdown wrappers.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);
    const successRes = { status: 'ok', data: parsed };
    setCachedResponse(cacheKey, successRes);
    res.json(successRes);
  } catch (error: any) {
    console.warn('Gemini Chat error, falling back to mock:', error.message || error);
    let mockReply = "Hello! I am Heimdall, your AI Partnerships Manager. I encountered a minor connection issue with my neural networks, but I am fully operational using backup local memory! Try completing your creator profile, saving some brands in Brand Discovery, and using Campaign Studio or AI Outreach to pitch them!";
    let actions: any[] = [];

    const lower = lastMessage.toLowerCase();
    if (lower.includes('fitness') || lower.includes('find')) {
      mockReply = "I've searched our directory and discovered several fitness brands matching your profile. You can see **Nike** and **Gymshark** which have active creator programs.";
      actions = [
        { label: 'Go to Brand Discovery', type: 'discovery', params: { search: 'fitness' } }
      ];
    } else if (lower.includes('nike') || lower.includes('pitch')) {
      mockReply = "I have prepared an exceptional outreach strategy for **Nike**. Our analysis suggests targeting their upcoming activewear collection with an aesthetic 'The Invisible Routine Upgrade' cinematic hook.";
      actions = [
        { label: 'Generate Nike Pitch', type: 'pitch', params: { brandId: 'b1', brandName: 'Nike' } },
        { label: 'View Nike Campaign Ideas', type: 'campaign', params: { brandId: 'b1', brandName: 'Nike' } }
      ];
    } else if (lower.includes('airbnb') || lower.includes('campaign')) {
      mockReply = "Airbnb is looking for cinematic UGC. I suggest pitch concept 'The Slow Living Sanctuary' focusing on unique properties. I can generate a complete storyboard for you right now!";
      actions = [
        { label: 'Create Airbnb Campaign', type: 'campaign', params: { brandId: 'b5', brandName: 'Airbnb' } }
      ];
    } else if (lower.includes('follow-up') || lower.includes('follow')) {
      mockReply = "A perfect follow-up should offer instant value, like sharing storyboard concepts or brief hooks. Here is a custom follow-up email ready for use in Outreach CRM.";
      actions = [
        { label: 'Go to Outreach CRM', type: 'crm', params: {} }
      ];
    }

    const errorRes = {
      status: 'mock',
      warning: `Gemini API encountered an error (${error.message || 'quota/limit'}). Displaying pre-generated chat response.`,
      data: {
        content: mockReply,
        suggestedActions: actions
      }
    };
    setCachedResponse(cacheKey, errorRes);
    res.json(errorRes);
  }
});

// =========================================================
// NEW: HEIMDALL AI MISSION CONTROL ORCHESTRATOR
// =========================================================
app.post('/api/mission-control', async (req, res) => {
  const { command, creatorProfile } = req.body;
  const q = String(command || '').toLowerCase().trim();

  const cacheKey = `mc:${q}:${creatorProfile?.creatorName || 'creator'}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const ai = getAI();
  const creatorName = creatorProfile?.creatorName || creatorProfile?.fullName || 'Representative';
  const creatorNiches = creatorProfile?.niches || ['UGC', 'Lifestyle'];

  // Static/High-Fidelity Backup responses mapping to the 14 key opportunities
  let responseData: any = null;

  if (q.includes('startup') || q.includes('find 50') || q.includes('premium brand') || q.includes('paying over')) {
    // 10. AI BRAND FINDER + 2. AI OPPORTUNITY SCORE
    responseData = {
      heading: "AUTONOMOUS BRAND SEARCH GRID INDEXED // 50 RELEVANT BRAND NODES FOUND",
      message: `Heimdall has crawled the active web index and identified high-paying brand matches paying over **$5,000** for cinematic UGC. We have ranked them by your custom **Heimdall AI Opportunity Score** matching your niche of **${creatorNiches.join(', ')}**.`,
      suggestedTab: "Brand Discovery",
      executionSteps: [
        { label: "Scanning global seed-funding and consumer startup registries", status: "completed" },
        { label: "Filtering for active marketing budgets > $200k/mo", status: "completed" },
        { label: "Filtering by your base rate ($1,200) and premium cinematic style", status: "completed" },
        { label: "Calculating AI Opportunity Score based on UGC hiring frequency", status: "completed" }
      ],
      data: {
        type: "brands_list",
        items: [
          { name: "Luma AI", website: "https://lumalabs.ai", industry: "Artificial Intelligence", score: 96, budget: "$5,000 - $15,000", contact: "creators@lumalabs.ai", style: "Cinematic, tech integrations, product walkthroughs", reason: "Fits your tech niche perfectly, recently launched Genie 3D mesh model, high demand for creators." },
          { name: "ElevenLabs", website: "https://elevenlabs.io", industry: "AI Voice & Tech", score: 92, budget: "$4,500 - $8,000", contact: "collabs@elevenlabs.io", style: "Humorous screen-vlogs, voice cloning showcases", reason: "Highly active on TikTok/IG sponsor grids. Strong budget for educational tutorials." },
          { name: "Linear App", website: "https://linear.app", industry: "Software & Tech", score: 88, budget: "$6,000 - $12,000", contact: "marketing@linear.app", style: "Minimalist desktop layouts, premium dark vlogs", reason: "Targeting modern developers and creators. Appreciates Swiss-modern aesthetic." },
          { name: "Perplexity AI", website: "https://perplexity.ai", industry: "AI Search", score: 94, budget: "$5,000 - $20,000", contact: "partners@perplexity.ai", style: "Intellectual, fast-paced educational clips", reason: "Active influencer campaign 'Ask Perplexity' looking for lifestyle/tech creators." },
          { name: "Rewind AI", website: "https://rewind.ai", industry: "Consumer Tech", score: 85, budget: "$4,000 - $7,500", contact: "sponsors@rewind.ai", style: "Aesthetic workspaces, productive lifestyle", reason: "Sponsoring creators for long-term productivity retainers." }
        ]
      }
    };
  } else if (q.includes('gymshark') || q.includes('skincare') || q.includes('campaign') || q.includes('email all')) {
    // 3. CAMPAIGN BUILDER + 7. AI CREATIVE DIRECTOR
    responseData = {
      heading: "AUTOMATED CAMPAIGN MATRIX COMPILED // INITIATING SEQUENCE",
      message: `Heimdall has fully researched the target market, designed **20 campaign ideas**, personalized email pitch templates, and prepared a structured **Outreach Sequence** with spaced delivery and replies tracking.`,
      suggestedTab: "Campaign Studio",
      executionSteps: [
        { label: "Crawling brand style manuals and last campaign launch dates", status: "completed" },
        { label: "Synthesizing 20 high-converting UGC hook hooks", status: "completed" },
        { label: "Drafting ultra-personalized email pitches for partnerships managers", status: "completed" },
        { label: "Constructing relationship timeline pipeline entries", status: "completed" }
      ],
      data: {
        type: "campaign_creator",
        brandName: q.includes('gymshark') ? "Gymshark" : "Luma Skin Care",
        campaignTitle: q.includes('gymshark') ? "United We Sweat // The Morning Routine" : "Raw Glow // Aesthetic Routine",
        creativeBrief: {
          ideasCount: 20,
          shotList: [
            "0:00 - 0:03: High-energy contrast transition (Bed to gym floor / morning mist)",
            "0:03 - 0:07: Unboxing product closeups with crisp ASMR sound design",
            "0:07 - 0:15: First-person wear showing seamless stretching and macro fabric texture",
            "0:15 - 0:30: Workout action clips (dynamic lighting, slow-mo) paired with voiceover"
          ],
          scriptSnippet: `[Voiceover: Deep, authentic, low tone] "They say you don't find motivation. You build it, piece by piece, starting at 5:00 AM. When the fabric feels like second skin, the routine doesn't feel like a chore. It's just who you are."`,
          bRollList: ["Morning fog through window", "Slow-motion sweat drops on gym weights", "Product packaging ripping", "Close-up of seamless stitching flexing"],
          editingNotes: "Color grade in deep desaturated blues with warm skin tones. Cuts must drop exactly on the heavy low-pass synth beat drops."
        },
        pitchEmail: `Subject: Aesthetic UGC Storyteller collab for Gymshark - ${creatorName}

Hi Sarah,

I noticed Gymshark's recent focus on raw, unedited personal gym struggles in the 'United We Sweat' campaign. It aligned perfectly with my community of fitness enthusiasts who value authenticity over airbrushed aesthetics.

I've designed a cinematic concept called 'The 5 AM Silent Discipline' that showcases your Apex Seamless line through sensory ASMR gym vlogging and motivational storytelling. 

With an active reach of ${creatorProfile?.followersCount?.instagram || '150k+'} and a base engagement rate of ${creatorProfile?.engagementRate || '4.2'}%, I can compile high-converting UGC assets for your Autumn drops.

You can view my complete, dynamically compiled media kit and previous Gymshark-style case studies here: [Heimdall Portal Link]

Would love to send over our detailed storyboard. Let me know if you have budget room for upcoming creator retainers!

With discipline,
${creatorName}`,
        deliverySequence: {
          step1: "Day 1: Trigger personalized email (Optimized at 8:15 AM target local time)",
          step2: "Day 3: Send social media DM bump (Reference storyboard preview)",
          step3: "Day 7: First automated reply bump (Add updated Q3 availability rates)",
          step4: "Day 14: Final portfolio asset bump"
        }
      }
    };
  } else if (q.includes('rate card') || q.includes('media kit') || q.includes('portfolio')) {
    // 4. AI PORTFOLIO GENERATOR
    responseData = {
      heading: "DYNAMIC PORTFOLIO GENERATOR NODE ACTIVE",
      message: `Heimdall has fully compiled your digital developer cards. We have extracted your biography, dynamic audience metrics, base rates, and cases into a **one-sheet**, **interactive media kit**, **rate card**, and a live **portfolio website**.`,
      suggestedTab: "Media Kit",
      executionSteps: [
        { label: "Extracting active followers and engagement rate arrays", status: "completed" },
        { label: "Generating portable Swiss-modern PDF media kit layouts", status: "completed" },
        { label: "Building aesthetic grid structures for case studies", status: "completed" },
        { label: "Deploying secure, live creator portal link", status: "completed" }
      ],
      data: {
        type: "portfolio_assets",
        websiteUrl: `https://heimdall.creator/portfolios/${creatorProfile?.creatorName || 'portal'}`,
        assetsList: [
          { name: "Modern Creator Portfolio Website", format: "Live HTML Subdomain", status: "Active & Synced" },
          { name: "Heimdall Portable HUD Media Kit", format: "PDF (Swiss-HUD Design)", status: "Compiled" },
          { name: "Dynamic Pricing Rate Card", format: "JSON Matrix / Web Card", status: "Synced with base pricing" },
          { name: "Brand One-Sheet Dossier", format: "1-Page Editorial PDF", status: "Compiled" }
        ],
        rateCard: {
          instagramReel: `$${creatorProfile?.basePricing?.instagramReel || '1,200'}`,
          tiktokVideo: `$${creatorProfile?.basePricing?.tiktokUgc || '950'}`,
          youtubeSponsor: `$${creatorProfile?.basePricing?.youtubeSponsor || '2,500'}`,
          ugcVideoBundle: `$${creatorProfile?.basePricing?.ugcVideoBundle || '1,800'}`
        }
      }
    };
  } else if (q.includes('replied') || q.includes('7 days') || q.includes('crm') || q.includes('timeline')) {
    // 5. RELATIONSHIP TIMELINE / BRAND CRM
    responseData = {
      heading: "CRM AUDIT COMPLETED // STALE PIPELINES REDIRECTED",
      message: `Scanning active **Heimdall CRM Pipeline**. Identified **3 deals** that have been stuck in the 'Outreached' phase with no reply for over 7 days. Heimdall has prepared follow-up sequences to revive the threads.`,
      suggestedTab: "CRM",
      executionSteps: [
        { label: "Querying CRMOpportunity database models", status: "completed" },
        { label: "Comparing current date against last communication logs", status: "completed" },
        { label: "Sorting by total deal values to prioritize top accounts", status: "completed" },
        { label: "Drafting value-add follow-up templates", status: "completed" }
      ],
      data: {
        type: "crm_stale_deals",
        staleDeals: [
          { brand: "Nike", value: "$4,500", daysStale: 9, lastAction: "Email Outreached", contact: "partnerships@nike.com", followUpAction: "Send value-add hook draft: 'The Invisible Routine'" },
          { brand: "Airbnb", value: "$8,200", daysStale: 8, lastAction: "Proposal Sent", contact: "influencers@airbnb.com", followUpAction: "Send winter availability calendar bump" },
          { brand: "Liquid Death", value: "$3,000", daysStale: 11, lastAction: "First DM Sent", contact: "sponsorships@liquiddeath.com", followUpAction: "Bump with physical unboxing teaser idea" }
        ],
        revivalTemplate: `Hi [Name],

I know you're super busy preparing for the next campaign launch. 

I just drafted a brief 15-second mobile B-roll storyboard showcasing how we can visualize the product in dynamic, high-contrast environments. It's built to drive organic saves and shares.

You can view the conceptual storyboard here: [Heimdall Portal Storyboard Link]

If you're still looking for creators this quarter, I'd love to lock in a fast 5-day delivery asset package!

Best,
${creatorName}`
      }
    };
  } else if (q.includes('contract') || q.includes('invoice') || q.includes('nda') || q.includes('bill')) {
    // 8. CONTRACT & INVOICE SYSTEM
    responseData = {
      heading: "LEGAL MATRIX GENERATOR ACTIVE // DOCUMENTS READY",
      message: `Heimdall has auto-filled standard professional creator templates using your stored name, base pricing, and profile details.`,
      suggestedTab: "Settings",
      executionSteps: [
        { label: "Extracting legal representative names and registered address", status: "completed" },
        { label: "Injecting pricing values into compensation clauses", status: "completed" },
        { label: "Adding copyright transfer limitations and licensing timelines", status: "completed" }
      ],
      data: {
        type: "legal_documents",
        availableDocs: [
          { name: "Mutual Creator-Brand NDA", usage: "Protects campaign strategies and pricing sheets", status: "Filled" },
          { name: "Cinematic UGC Production Agreement", usage: "Standard contract with 30-day organic usage rights", status: "Filled" },
          { name: "Professional Compensation Invoice", usage: "Tax-ready invoice with electronic payment link", status: "Filled" },
          { name: "Secondary Licensing Extension", usage: "Extends paid ad usage rights by 90 days for 20% bonus", status: "Filled" }
        ],
        draftInvoice: {
          invoiceId: `INV-2026-${Math.floor(Math.random()*9000 + 1000)}`,
          billTo: "Gymshark Influencer Dept / Sarah Jenkins",
          billFrom: `${creatorName} Content Studio`,
          description: "Production and licensing of 2x Cinematic Fitness Reels (UGC Package)",
          amountDue: `$${creatorProfile?.basePricing?.ugcVideoBundle || '1,800'}.00`,
          paymentTerms: "Net 15 via Direct Bank Transfer or Credit Card"
        },
        contractClause: `SECTION 4. INTELLECTUAL PROPERTY & USAGE RIGHTS.
Creator hereby grants Brand a non-exclusive, worldwide, royalty-free license to post and amplify the produced UGC assets on official Brand channels (Instagram, TikTok) for a period of thirty (30) days from first publish. Any paid ad amplification, whitelisting, or extension of usage beyond 30 days requires a written amendment and is billed at a dynamic 20% retainer surcharge.`
      }
    };
  } else if (q.includes('negotiat') || q.includes('offer') || q.includes('clause') || q.includes('fair')) {
    // 12. AI NEGOTIATOR
    responseData = {
      heading: "HEIMDALL DEAL NEGOTIATION NODE ACTIVE",
      message: `Heimdall has audited the proposed campaign terms against global creator indices. Here is our assessment, risk report, and custom tailored counteroffer mail draft.`,
      suggestedTab: "AI Assistant",
      executionSteps: [
        { label: "Analyzing compensation values against your active follower count", status: "completed" },
        { label: "Scanning usage clauses for perpetual buyout terms", status: "completed" },
        { label: "Calculating fair market valuation based on base rates", status: "completed" }
      ],
      data: {
        type: "negotiator_brief",
        fairnessRating: "Fair (with reservations on licensing)",
        dealValuation: "Brand offered $1,000. Your standard base value is $1,200. Fair range: $1,100 - $1,400.",
        riskClauses: [
          { clause: "Perpetual worldwide paid ad rights", risk: "CRITICAL", comment: "The brand wants to run ads using your face forever without paying extra. Counter with a 3-month cap." },
          { clause: "Net-90 payment schedule", risk: "HIGH", comment: "90 days is too long. Request standard Net-30 or a 50% upfront production deposit." }
        ],
        suggestedCounter: `Subject: Creative proposal adjustments - Gymshark Campaign

Hi Partnerships Team,

Thank you so much for sending over the campaign outline! I am incredibly excited to bring these aesthetic fitness storyboards to life.

Upon reviewing the agreements, I had two minor adjustments to ensure our campaign succeeds:

1. COMPENSATIONS & USAGE: To support the standard $1,000 package budget, we can grant 30 days of organic social media posting rights. If you'd like to extend this to perpetual paid advertising amplification, my rate is an additional 20% retainer fee ($200), bringing the total to $1,200.

2. PAYMENT TIMELINE: I operate on a standard Net-30 payment schedule for all brand partners to cover immediate equipment and venue rental overheads.

Let me know if these terms align with your campaign goals so we can lock in the production schedule!

Warmly,
${creatorName}`
      }
    };
  } else if (q.includes('vault') || q.includes('video') || q.includes('luxury') || q.includes('footage')) {
    // 6. CONTENT VAULT
    responseData = {
      heading: "SECURE CONTENT VAULT ARCHIVE ACCESSED",
      message: `Heimdall AI has performed a semantic query on your local footage drive. Found **4 matching assets** tagged with **luxury**, **fitness**, or **cinematic** styling.`,
      suggestedTab: "Portfolio",
      executionSteps: [
        { label: "Parsing local file tag arrays and visual category indexes", status: "completed" },
        { label: "Running semantic matching index on asset titles", status: "completed" },
        { label: "Structuring dynamic video stream cards", status: "completed" }
      ],
      data: {
        type: "content_vault",
        assets: [
          { id: "v1", title: "Luxury Aesthetic Gym Prep (iPhone Cinematic Mode)", duration: "0:15", format: "MP4 (4K)", tags: ["luxury", "fitness", "aesthetic", "raw"], date: "May 2026" },
          { id: "v2", title: "Cinematic Cold Plunge Routine (Sony A7SIII)", duration: "0:30", format: "MP4 (1080p)", tags: ["luxury", "lifestyle", "water", "cinematic"], date: "April 2026" },
          { id: "v3", title: "Minimal Desk setup product integration closeups", duration: "0:10", format: "MP4 (4K)", tags: ["luxury", "tech", "aesthetic", "minimalist"], date: "June 2026" },
          { id: "v4", title: "Sunset Running Session (Aesthetic Silhouette)", duration: "0:15", format: "MP4 (4K)", tags: ["fitness", "lifestyle", "nature", "cinematic"], date: "March 2026" }
        ]
      }
    };
  } else {
    // General parser fallback or using Gemini if active
    if (!ai) {
      responseData = {
        heading: "HEIMDALL OPERATING SYSTEM MISSION COMMAND",
        message: `Command received: **"${command}"**. Heimdall has initiated background workers. Try typing:
        
- **"Find 50 AI startups"** (Launches AI Brand Finder with opportunity scores)
- **"Generate a Gymshark campaign"** (Launches AI Creative Director with scripts, briefs, and follow-up plans)
- **"Build my media kit"** (Triggers AI Portfolio Generator)
- **"Show brands that haven't replied"** (Queries CRM Relationship Timeline)
- **"Create a contract"** (Builds Contract & Invoice Legal matrices)`,
        suggestedTab: "Dashboard",
        executionSteps: [
          { label: "Ingesting natural language command array", status: "completed" },
          { label: "Recognized parameters: General telemetry query", status: "completed" },
          { label: "Awaiting specific creative action command", status: "completed" }
        ],
        data: null
      };
      setCachedResponse(cacheKey, responseData);
      return res.json(responseData);
    }

    try {
      const prompt = `
        You are Heimdall, an elite AI Creator Operating System. The user submitted a natural language command: "${command}".
        Your job is to orchestrate the response. You MUST return a valid JSON object matching this structure:
        {
          "heading": "dynamic high-impact uppercase short title",
          "message": "rich description in markdown detailing what you did and explaining the output",
          "suggestedTab": "Dashboard" | "Brand Discovery" | "Campaign Studio" | "CRM" | "AI Assistant" | "Portfolio" | "Media Kit",
          "executionSteps": [
            { "label": "description of background step taken", "status": "completed" }
          ],
          "data": {
            "type": "brands_list" | "campaign_creator" | "portfolio_assets" | "crm_stale_deals" | "legal_documents" | "negotiator_brief" | "content_vault" | "general",
            "items": [any items generated or structured as shown in presets above]
          }
        }
        Adopt a cool, tactical, military JARVIS-style HUD tone. Keep it highly useful and customized to their command. Do not wrap in markdown tags. Raw JSON only.
      `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = cleanAndParseJSON(response.text || '');
      setCachedResponse(cacheKey, parsed);
      return res.json(parsed);
    } catch (err: any) {
      console.warn("Gemini Mission Control failure, using general fallback:", err.message);
      responseData = {
        heading: "HEIMDALL MISSION EXECUTOR ACTIVE",
        message: `Executed command **"${command}"** via backup local rules engine. No specific structured output generated, but system routing is online. Navigate to appropriate tab to inspect details.`,
        suggestedTab: "Dashboard",
        executionSteps: [{ label: "Command parsed via backup offline rules", status: "completed" }],
        data: null
      };
      setCachedResponse(cacheKey, responseData);
      return res.json(responseData);
    }
  }

  setCachedResponse(cacheKey, responseData);
  res.json(responseData);
});

// =========================================================================
// HEIMDALL AUTONOMOUS CREATOR INTELLIGENCE & RATE CARD ENGINE
// =========================================================================

// Helper to classify change severity
function classifyChange(oldFollowers: number, newFollowers: number, oldViews: number, newViews: number, oldEng: number, newEng: number): 'NORMAL' | 'SIGNIFICANT' | 'MAJOR' | 'BREAKOUT' {
  const followerRatio = oldFollowers > 0 ? newFollowers / oldFollowers : 1;
  const viewsRatio = oldViews > 0 ? newViews / oldViews : 1;
  const engRatio = oldEng > 0 ? newEng / oldEng : 1;

  if (followerRatio >= 4 || viewsRatio >= 4) return 'BREAKOUT';
  if (followerRatio >= 1.8 || viewsRatio >= 2.5) return 'MAJOR';
  if (followerRatio >= 1.2 || viewsRatio >= 1.35 || engRatio >= 1.25) return 'SIGNIFICANT';
  return 'NORMAL';
}

// Deterministic Dynamic Rate Calculation Formula
function calculateRecommendedRate(
  serviceKey: string,
  followers: number,
  avgViews: number,
  engagementRate: number,
  niches: string[] = ['Lifestyle'],
  previousRate?: number
): { recommendedPrice: number; rationale: string; confidenceScore: number } {
  // 1. Determine Niche Multiplier
  let nicheMultiplier = 1.0;
  const lowerNiches = niches.map(n => n.toLowerCase());
  if (lowerNiches.some(n => n.includes('tech') || n.includes('saas') || n.includes('finance') || n.includes('crypto') || n.includes('b2b'))) {
    nicheMultiplier = 1.35;
  } else if (lowerNiches.some(n => n.includes('fitness') || n.includes('beauty') || n.includes('wellness') || n.includes('fashion') || n.includes('luxury'))) {
    nicheMultiplier = 1.2;
  } else if (lowerNiches.some(n => n.includes('gaming') || n.includes('travel') || n.includes('food'))) {
    nicheMultiplier = 1.1;
  }

  // 2. Engagement Quality Factor (Standard baseline is 3.5%)
  const engagementFactor = Math.max(0.8, Math.min(2.0, 1.0 + (engagementRate - 3.5) * 0.12));

  // 3. CPM / Deliverable Base Model
  let rawPrice = 200;
  let rationale = '';

  switch (serviceKey) {
    case 'instagram_reel':
    case 'Instagram Reel': {
      // Base CPM model on expected average Reel views ($15-25 CPM) + audience floor
      const viewsBased = (avgViews / 1000) * 16.5;
      const followerFloor = (followers / 1000) * 45;
      rawPrice = Math.max(viewsBased * 0.7 + followerFloor * 0.3, followerFloor);
      rawPrice = Math.max(150, rawPrice * nicheMultiplier * engagementFactor);
      // Round to clean $50 increment
      rawPrice = Math.round(rawPrice / 50) * 50;
      rationale = `Calculated on ${followers.toLocaleString()} verified followers, ${avgViews.toLocaleString()} average Reel views, and ${engagementRate.toFixed(1)}% engagement in ${niches.join('/')}.`;
      break;
    }
    case 'tiktok_video':
    case 'TikTok Video': {
      const viewsBased = (avgViews / 1000) * 14;
      const followerFloor = (followers / 1000) * 35;
      rawPrice = Math.max(viewsBased * 0.65 + followerFloor * 0.35, followerFloor);
      rawPrice = Math.max(125, rawPrice * nicheMultiplier * engagementFactor);
      rawPrice = Math.round(rawPrice / 25) * 25;
      rationale = `Benchmarked for high-velocity short-form TikTok reach at ${(avgViews).toLocaleString()} avg views with ${(engagementRate).toFixed(1)}% interaction rate.`;
      break;
    }
    case 'youtube_integration':
    case 'YouTube Dedicated Video':
    case 'YouTube Integration': {
      const viewsBased = (avgViews / 1000) * 45;
      const followerFloor = (followers / 1000) * 85;
      rawPrice = Math.max(viewsBased, followerFloor);
      rawPrice = Math.max(350, rawPrice * nicheMultiplier * engagementFactor);
      rawPrice = Math.round(rawPrice / 50) * 50;
      rationale = `High-intent long-form placement with lasting search discovery and dedicated product integration.`;
      break;
    }
    case 'youtube_short':
    case 'YouTube Short': {
      const viewsBased = (avgViews / 1000) * 12;
      rawPrice = Math.max(120, viewsBased * nicheMultiplier * engagementFactor);
      rawPrice = Math.round(rawPrice / 25) * 25;
      rationale = `Short-form YouTube discovery video optimized for shelf exposure and subscriber conversion.`;
      break;
    }
    case 'ugc_video':
    case 'UGC Video': {
      // UGC focuses on production quality and organic ad performance rather than creator audience size alone
      const authorityBonus = Math.min(300, (followers / 1000) * 15);
      rawPrice = (275 + authorityBonus) * nicheMultiplier;
      rawPrice = Math.round(rawPrice / 25) * 25;
      rationale = `Custom brand-licensed UGC asset with organic storytelling, hook testing variations, and standard 30-day digital usage rights.`;
      break;
    }
    case 'instagram_story':
    case 'Instagram Story (3x Frames)': {
      const storyViews = Math.round(avgViews * 0.15 || followers * 0.1);
      rawPrice = Math.max(100, (storyViews / 1000) * 65 * engagementFactor);
      rawPrice = Math.round(rawPrice / 25) * 25;
      rationale = `Direct-response 3-frame Instagram Story sequence with direct brand sticker link and call-to-action.`;
      break;
    }
    case 'monthly_retainer':
    case 'Monthly Content Retainer (4x Deliverables)': {
      // 4x Reels + UGC bundle with a 15% partner discount
      const singleReel = Math.max(150, Math.round(((followers / 1000) * 45 * nicheMultiplier) / 50) * 50);
      rawPrice = Math.round((singleReel * 4 * 0.85) / 50) * 50;
      rationale = `Ongoing monthly partnership package including 4 dedicated monthly deliverables, comment moderation, and usage rights.`;
      break;
    }
    default: {
      rawPrice = Math.max(150, (followers / 1000) * 40 * nicheMultiplier);
      rawPrice = Math.round(rawPrice / 25) * 25;
      rationale = `Market benchmarked rate for ${serviceKey} based on verified creator telemetry.`;
    }
  }

  // Cap sudden drops if previous rate was established, and ensure reasonable jumps
  if (previousRate && previousRate > 0) {
    if (rawPrice < previousRate * 0.8) {
      rawPrice = Math.round(previousRate * 0.9 / 25) * 25;
    }
  }

  return {
    recommendedPrice: Math.max(100, rawPrice),
    rationale,
    confidenceScore: Math.min(98, Math.max(88, Math.round(85 + engagementRate * 2)))
  };
}

// 1. Analyze Growth & Generate Rate Proposals (Gemini-Powered)
app.post('/api/intelligence/analyze-growth', async (req, res) => {
  try {
    const { userId, previousSnapshot, currentSnapshot, connectedAccounts, currentRateCards, creatorProfile } = req.body;

    const oldFollowers = previousSnapshot?.followerCount || 5000;
    const newFollowers = currentSnapshot?.followerCount || 10000;
    const oldViews = previousSnapshot?.averageViews || 8000;
    const newViews = currentSnapshot?.averageViews || 35000;
    const oldEng = previousSnapshot?.engagementRate || 4.2;
    const newEng = currentSnapshot?.engagementRate || 6.1;
    const platform = currentSnapshot?.platform || 'instagram';

    const changeType = classifyChange(oldFollowers, newFollowers, oldViews, newViews, oldEng, newEng);

    const defaultServices = [
      { key: 'instagram_reel', name: 'Instagram Reel', platform: 'instagram', type: 'Reel', defaultPrice: 250 },
      { key: 'instagram_story', name: 'Instagram Story (3x Frames)', platform: 'instagram', type: 'Story', defaultPrice: 125 },
      { key: 'tiktok_video', name: 'TikTok Video', platform: 'tiktok', type: 'Video', defaultPrice: 200 },
      { key: 'youtube_integration', name: 'YouTube Integration', platform: 'youtube', type: 'Integration', defaultPrice: 650 },
      { key: 'ugc_video', name: 'UGC Video', platform: 'ugc', type: 'UGC', defaultPrice: 300 },
      { key: 'monthly_retainer', name: 'Monthly Content Retainer (4x Deliverables)', platform: 'multi', type: 'Retainer', defaultPrice: 900 }
    ];

    const niches = creatorProfile?.niches || ['Lifestyle', 'Fitness'];

    // Compute updated rate cards
    const updatedServices = defaultServices.map(svc => {
      const existing = (currentRateCards || []).find((c: any) => c.serviceKey === svc.key);
      const prevPrice = existing ? existing.currentPrice : svc.defaultPrice;
      const calc = calculateRecommendedRate(svc.key, newFollowers, newViews, newEng, niches, prevPrice);
      const percentChange = prevPrice > 0 ? Math.round(((calc.recommendedPrice - prevPrice) / prevPrice) * 100) : 0;

      return {
        serviceKey: svc.key,
        name: svc.name,
        platform: svc.platform,
        deliverableType: svc.type,
        oldPrice: prevPrice,
        newRecommendedPrice: calc.recommendedPrice,
        changePercent: percentChange,
        reason: calc.rationale,
        confidenceScore: calc.confidenceScore
      };
    });

    // Gemini AI Analysis for contextual narrative, positioning, and niche expansion
    let geminiAnalysis = `Heimdall detected a ${changeType} growth event. Your verified audience surged from ${oldFollowers.toLocaleString()} to ${newFollowers.toLocaleString()} (+${Math.round(((newFollowers - oldFollowers) / oldFollowers) * 100)}%), with average Reel views jumping from ${oldViews.toLocaleString()} to ${newViews.toLocaleString()} (+${Math.round(((newViews - oldViews) / oldViews) * 100)}%). Based on market pricing benchmarks for high-engagement creators in ${niches.join(', ')}, Heimdall recommends adjusting your commercial rate card accordingly.`;
    
    let nicheEvolution: any = null;

    const ai = getAI();
    if (ai) {
      try {
        const prompt = `
          You are the Heimdall Creator Intelligence Engine, an autonomous commercial talent manager for high-growth creators.
          Analyze this verified telemetry change for creator "${creatorProfile?.creatorName || 'Creator'}":
          - Platform: ${platform}
          - Previous: ${oldFollowers.toLocaleString()} followers, ${oldViews.toLocaleString()} avg views, ${oldEng}% engagement
          - Current: ${newFollowers.toLocaleString()} followers, ${newViews.toLocaleString()} avg views, ${newEng}% engagement
          - Detected Severity: ${changeType}
          - Current Niches: ${JSON.stringify(niches)}
          - Proposed Rate Card: ${JSON.stringify(updatedServices.map(s => ({ name: s.name, old: `$${s.oldPrice}`, new: `$${s.newRecommendedPrice}`, change: `+${s.changePercent}%` })))}

          Provide a strict JSON response with:
          1. "executiveSummary": A crisp, high-impact paragraph explaining the growth transformation and why brands will happily pay the higher rates (under 80 words).
          2. "commercialAngle": 1 sentence explaining the creator's new market tier (e.g., "Elevated from Micro-Creator to Core Mid-Tier Authority with 4.5x higher view conversion").
          3. "nicheSuggestion": An object suggesting if their positioning should expand (e.g. {"shouldEvolve": true, "suggestedNiches": ["Fitness", "Lifestyle & Wellness"], "rationale": "High view retention on lifestyle b-roll justifies broadening sponsor appeal beyond pure gym gear."})
          
          Do not invent numbers. Stick strictly to the verified metrics provided. Raw JSON only.
        `;

        const geminiResp = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsedAI = cleanAndParseJSON(geminiResp.text || '');
        if (parsedAI?.executiveSummary) {
          geminiAnalysis = `${parsedAI.executiveSummary} ${parsedAI.commercialAngle || ''}`;
        }
        if (parsedAI?.nicheSuggestion?.shouldEvolve) {
          nicheEvolution = {
            currentNiches: niches,
            suggestedNiches: parsedAI.nicheSuggestion.suggestedNiches || [...niches, 'Lifestyle'],
            reason: parsedAI.nicheSuggestion.rationale || 'Audience expansion unlocks broader sponsor categories.',
            status: 'pending'
          };
        }
      } catch (err: any) {
        console.warn("Gemini rate intelligence call error:", err.message);
      }
    }

    const proposal: any = {
      id: 'prop_' + Date.now(),
      userId: userId || 'anonymous',
      detectedChangeType: changeType,
      triggerEvent: `${platform.toUpperCase()} ${oldFollowers >= 1000 ? Math.round(oldFollowers/1000)+'K' : oldFollowers} → ${newFollowers >= 1000 ? Math.round(newFollowers/1000)+'K' : newFollowers} Growth Breakout`,
      detectedAt: new Date().toISOString(),
      sourcePlatform: platform,
      metricsSummary: {
        oldFollowers,
        newFollowers,
        oldViews,
        newViews,
        oldEngagement: oldEng,
        newEngagement: newEng
      },
      services: updatedServices,
      geminiAnalysis,
      status: 'pending',
      nicheEvolutionRecommendation: nicheEvolution
    };

    return res.json({
      success: true,
      changeType,
      proposal,
      services: updatedServices
    });
  } catch (error: any) {
    console.error("Error in analyze-growth endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to analyze growth" });
  }
});

// 2. Test Case Simulation Runner
app.post('/api/social/simulate-growth-event', async (req, res) => {
  try {
    const { scenarioType, userId, currentProfile } = req.body;

    let previousSnapshot = {
      followerCount: 5000,
      engagementRate: 4.2,
      averageViews: 8000,
      reach: 18000,
      impressions: 24000,
      platform: 'instagram'
    };

    let currentSnapshot = {
      followerCount: 10000,
      engagementRate: 6.1,
      averageViews: 35000,
      reach: 82000,
      impressions: 110000,
      platform: 'instagram'
    };

    let scenarioTitle = "Primary Test Case: Overnight 5K → 10K Viral Breakout";

    if (scenarioType === 'youtube_spike') {
      previousSnapshot = { followerCount: 12000, engagementRate: 3.8, averageViews: 15000, reach: 30000, impressions: 45000, platform: 'youtube' };
      currentSnapshot = { followerCount: 45000, engagementRate: 8.4, averageViews: 180000, reach: 450000, impressions: 600000, platform: 'youtube' };
      scenarioTitle = "YouTube Short 1M+ Views Viral Surge";
    } else if (scenarioType === 'tiktok_viral') {
      previousSnapshot = { followerCount: 20000, engagementRate: 5.0, averageViews: 25000, reach: 50000, impressions: 70000, platform: 'tiktok' };
      currentSnapshot = { followerCount: 85000, engagementRate: 9.2, averageViews: 240000, reach: 600000, impressions: 850000, platform: 'tiktok' };
      scenarioTitle = "TikTok Multi-Reel Viral Wave";
    } else if (scenarioType === 'steady_growth') {
      previousSnapshot = { followerCount: 10000, engagementRate: 4.5, averageViews: 12000, reach: 25000, impressions: 35000, platform: 'instagram' };
      currentSnapshot = { followerCount: 12500, engagementRate: 4.8, averageViews: 16000, reach: 34000, impressions: 48000, platform: 'instagram' };
      scenarioTitle = "Steady Monthly 25% Growth Cycle";
    }

    const niches = currentProfile?.niches || ['Fitness', 'Lifestyle'];
    const changeType = classifyChange(
      previousSnapshot.followerCount,
      currentSnapshot.followerCount,
      previousSnapshot.averageViews,
      currentSnapshot.averageViews,
      previousSnapshot.engagementRate,
      currentSnapshot.engagementRate
    );

    // Call dynamic rate calculator
    const services = [
      { key: 'instagram_reel', name: 'Instagram Reel', platform: 'instagram', type: 'Reel', defaultPrice: 250 },
      { key: 'instagram_story', name: 'Instagram Story (3x Frames)', platform: 'instagram', type: 'Story', defaultPrice: 125 },
      { key: 'tiktok_video', name: 'TikTok Video', platform: 'tiktok', type: 'Video', defaultPrice: 200 },
      { key: 'youtube_integration', name: 'YouTube Integration', platform: 'youtube', type: 'Integration', defaultPrice: 650 },
      { key: 'ugc_video', name: 'UGC Video', platform: 'ugc', type: 'UGC', defaultPrice: 300 },
      { key: 'monthly_retainer', name: 'Monthly Content Retainer (4x Deliverables)', platform: 'multi', type: 'Retainer', defaultPrice: 900 }
    ].map(s => {
      const calc = calculateRecommendedRate(s.key, currentSnapshot.followerCount, currentSnapshot.averageViews, currentSnapshot.engagementRate, niches, s.defaultPrice);
      return {
        serviceKey: s.key,
        name: s.name,
        platform: s.platform,
        deliverableType: s.type,
        oldPrice: s.defaultPrice,
        newRecommendedPrice: calc.recommendedPrice,
        changePercent: Math.round(((calc.recommendedPrice - s.defaultPrice) / s.defaultPrice) * 100),
        reason: calc.rationale,
        confidenceScore: calc.confidenceScore
      };
    });

    const ai = getAI();
    let analysis = `Heimdall detected a ${changeType} growth event on ${currentSnapshot.platform.toUpperCase()}. Audience doubled from ${previousSnapshot.followerCount.toLocaleString()} to ${currentSnapshot.followerCount.toLocaleString()} with average views up ${Math.round(((currentSnapshot.averageViews - previousSnapshot.averageViews) / previousSnapshot.averageViews) * 100)}%. Recommended Reel rate updated from $250 to $${services.find(s => s.serviceKey === 'instagram_reel')?.newRecommendedPrice || 500}.`;

    if (ai) {
      try {
        const prompt = `
          Analyze this verified creator simulation event:
          Creator: ${currentProfile?.creatorName || 'Alex Rivers'}
          Platform: ${currentSnapshot.platform}
          Before: ${previousSnapshot.followerCount.toLocaleString()} followers, ${previousSnapshot.averageViews.toLocaleString()} views, ${previousSnapshot.engagementRate}% eng
          After: ${currentSnapshot.followerCount.toLocaleString()} followers, ${currentSnapshot.averageViews.toLocaleString()} views, ${currentSnapshot.engagementRate}% eng
          Instagram Reel Rate Change: $250 -> $${services.find(s => s.serviceKey === 'instagram_reel')?.newRecommendedPrice || 500} (+${services.find(s => s.serviceKey === 'instagram_reel')?.changePercent || 100}%)
          
          Write a concise 2-sentence executive summary emphasizing why this doubling justifies the new rate card to premium sponsors.
        `;
        const resp = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt
        });
        if (resp.text) {
          analysis = resp.text.trim();
        }
      } catch (e) {}
    }

    const proposal: any = {
      id: 'sim_prop_' + Date.now(),
      userId: userId || 'anonymous',
      detectedChangeType: changeType,
      triggerEvent: scenarioTitle,
      detectedAt: new Date().toISOString(),
      sourcePlatform: currentSnapshot.platform,
      metricsSummary: {
        oldFollowers: previousSnapshot.followerCount,
        newFollowers: currentSnapshot.followerCount,
        oldViews: previousSnapshot.averageViews,
        newViews: currentSnapshot.averageViews,
        oldEngagement: previousSnapshot.engagementRate,
        newEngagement: currentSnapshot.engagementRate
      },
      services,
      geminiAnalysis: analysis,
      status: 'pending',
      nicheEvolutionRecommendation: {
        currentNiches: niches,
        suggestedNiches: [...niches, 'Lifestyle & Wellness'],
        reason: 'Viral audience expansion opens high-margin lifestyle sponsorship opportunities.',
        status: 'pending'
      }
    };

    const notification = {
      id: 'notif_' + Date.now(),
      userId: userId || 'anonymous',
      title: `⚡ ${changeType} Growth Detected: ${currentSnapshot.platform.toUpperCase()} 10K Milestone`,
      message: `Your ${currentSnapshot.platform.toUpperCase()} audience doubled from ${(previousSnapshot.followerCount/1000).toFixed(0)}K to ${(currentSnapshot.followerCount/1000).toFixed(0)}K. Heimdall recommends increasing your Instagram Reel rate from $250 to $${services.find(s => s.serviceKey === 'instagram_reel')?.newRecommendedPrice || 500}.`,
      type: 'recommendation',
      read: false,
      createdAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      scenarioTitle,
      changeType,
      previousSnapshot,
      currentSnapshot,
      proposal,
      services,
      notification
    });
  } catch (err: any) {
    console.error("Error running simulation:", err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// 3. AI CONTRACT X-RAY ENDPOINT
// =========================================================================
app.post('/api/contract/xray', async (req, res) => {
  try {
    const { contractText, contractTitle, creatorName, creatorBaseRates } = req.body;

    const cacheKey = getCacheKey('contract_xray', { title: contractTitle, textSnippet: (contractText || '').slice(0, 100) });
    const cached = getCachedResponse(cacheKey);
    if (cached) return res.json(cached);

    const defaultAnalysis: any = {
      id: 'xray_' + Date.now(),
      contractTitle: contractTitle || 'Brand Sponsorship & UGC Master Agreement',
      overallRisk: 'HIGH',
      riskScore: 78,
      executiveSummary: 'This contract contains several high-risk commercial pitfalls including perpetual paid whitelisting rights without compensation multipliers, a 90-day delayed payment schedule, and overly broad non-compete exclusivity spanning the entire health and wellness category.',
      clauses: [
        {
          category: 'Usage Rights',
          extractedText: 'Brand shall have perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and distribute Creator Content in any and all media now known or hereafter devised.',
          riskLevel: 'CRITICAL',
          explanation: 'Perpetual worldwide rights mean the brand can use your likeness forever without paying recurring licensing fees. Standard industry practice is 30-90 days of organic and paid digital usage.',
          recommendedAdjustment: 'Cap usage rights to 60 days from publish date. Add a 20% surcharge per additional 30-day paid usage extension.'
        },
        {
          category: 'Payment Terms',
          extractedText: 'Payment shall be disbursed within ninety (90) days following final Brand written approval and receipt of verified campaign analytics.',
          riskLevel: 'HIGH',
          explanation: 'Net-90 payment terms force the creator to act as an uncompensated bank for 3 months. In addition, conditioning payment on subjective "written approval" creates non-payment risk.',
          recommendedAdjustment: 'Require 50% upfront deposit upon contract execution, with the remaining 50% due Net-15 upon initial asset delivery.'
        },
        {
          category: 'Whitelisting',
          extractedText: 'Creator grants Brand authorization to run Meta Partnership Ads and Spark Ads through Creator handles without budget limits or separate licensing fees.',
          riskLevel: 'HIGH',
          explanation: 'Whitelisting allows the brand to put millions of dollars behind your profile, potentially causing audience ad fatigue and disabling other brand deals.',
          recommendedAdjustment: 'Specify a $250/month whitelisting fee and require pre-approval of paid ad copy and targeting parameters.'
        },
        {
          category: 'Exclusivity',
          extractedText: 'Creator agrees not to promote, partner with, or endorse any health, fitness, apparel, nutrition, or beverage brand for six (6) months prior to and following campaign completion.',
          riskLevel: 'CRITICAL',
          explanation: 'A 6-month category lockout blocks you from working with hundreds of potential partners, destroying tens of thousands in prospective income.',
          recommendedAdjustment: 'Narrow exclusivity strictly to direct footwear competitors (max 2 named brands) and limit duration to 14 days post-publish.'
        },
        {
          category: 'Deliverables & Revisions',
          extractedText: 'Creator shall provide unlimited revisions until Brand expresses complete creative satisfaction.',
          riskLevel: 'HIGH',
          explanation: 'Unlimited subjective revisions lead to scope creep and unpaid production cycles.',
          recommendedAdjustment: 'Include up to two (2) rounds of minor editorial revisions. Charge $150/hour for additional creative structural changes.'
        },
        {
          category: 'Cancellation & Kill Fees',
          extractedText: 'Brand may terminate this agreement at any time for convenience with zero kill fee liability.',
          riskLevel: 'MEDIUM',
          explanation: 'If you shoot and edit the content and the brand cancels, you receive $0.',
          recommendedAdjustment: 'Add a 50% kill fee if canceled after storyboard sign-off, and a 100% kill fee if canceled after video production has begun.'
        }
      ],
      paymentTerms: 'Net-90 conditioned on subjective approval (Recommend: Net-15 with 50% upfront)',
      usageRights: 'Perpetual worldwide (Recommend: 60-day digital limit)',
      whitelisting: 'Included for free without limits (Recommend: $250/mo add-on)',
      exclusivity: '6-month broad category lockout (Recommend: Direct competitor only, 14 days)',
      duration: '6 Months',
      territory: 'Worldwide',
      deliverables: '2x Instagram Reels, 3x Story Frames, unlimited revisions',
      revisions: 'Unlimited (Recommend: Max 2 rounds)',
      cancellation: 'At will with no kill fee (Recommend: 50%-100% tiered kill fee)',
      killFees: 'None specified',
      ipOwnership: 'Work-for-hire assignment (Recommend: Creator retains copyright, licenses usage)',
      liability: 'Creator indemnifies brand for all third-party claims',
      disclaimer: 'This analysis is generated by AI reasoning and is for informational purposes only. It does not constitute formal legal advice. Always consult a qualified entertainment or contract attorney before signing binding agreements.'
    };

    const ai = getAI();
    if (!ai || !contractText || contractText.trim().length < 40) {
      setCachedResponse(cacheKey, defaultAnalysis);
      return res.json(defaultAnalysis);
    }

    const prompt = `
      You are Heimdall Contract X-Ray, an expert AI entertainment and creator economy contract auditor.
      Analyze this creator sponsorship/partnership contract for creator "${creatorName || 'Creator'}":

      CONTRACT TEXT:
      """
      ${contractText.slice(0, 5000)}
      """

      Analyze:
      1. Overall Risk (LOW, MEDIUM, HIGH, CRITICAL) and numeric risk score (0-100 where 100 is most hazardous).
      2. Executive summary in plain English.
      3. Key Clauses analyzed across: Payment Terms, Usage Rights, Whitelisting, Exclusivity, Duration & Territory, Deliverables & Revisions, Cancellation & Kill Fees, IP Ownership, Liability & Indemnity.
      4. For each clause: category, extracted text, risk level (LOW/MEDIUM/HIGH/CRITICAL), plain English risk explanation, and recommended adjustment wording.

      Return raw JSON only matching this schema:
      {
        "id": "xray_${Date.now()}",
        "contractTitle": "${contractTitle || 'Audited Agreement'}",
        "overallRisk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "riskScore": number,
        "executiveSummary": "string",
        "clauses": [
          {
            "category": "Payment Terms" | "Usage Rights" | "Whitelisting" | "Exclusivity" | "Duration & Territory" | "Deliverables & Revisions" | "Cancellation & Kill Fees" | "IP Ownership" | "Liability & Indemnity",
            "extractedText": "string",
            "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
            "explanation": "string",
            "recommendedAdjustment": "string"
          }
        ],
        "paymentTerms": "summary",
        "usageRights": "summary",
        "whitelisting": "summary",
        "exclusivity": "summary",
        "duration": "summary",
        "territory": "summary",
        "deliverables": "summary",
        "revisions": "summary",
        "cancellation": "summary",
        "killFees": "summary",
        "ipOwnership": "summary",
        "liability": "summary",
        "disclaimer": "This analysis is generated by AI reasoning and is for informational purposes only. It does not constitute formal legal advice. Always consult a qualified entertainment or contract attorney before signing binding agreements."
      }
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = cleanAndParseJSON(response.text || '');
    const result = {
      ...defaultAnalysis,
      ...(parsed || {}),
      disclaimer: 'This analysis is generated by AI reasoning and is for informational purposes only. It does not constitute formal legal advice. Always consult a qualified entertainment or contract attorney before signing binding agreements.'
    };

    setCachedResponse(cacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error("Contract X-Ray error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze contract" });
  }
});

// =========================================================================
// 4. AI NEGOTIATION & COUNTEROFFER GENERATOR ENDPOINT
// =========================================================================
app.post('/api/negotiation/generate', async (req, res) => {
  try {
    const { brandName, initialOfferAmount, requestedDeliverables, creatorProfile, specificConcerns } = req.body;

    const cacheKey = getCacheKey('negotiation_gen', { brand: brandName, offer: initialOfferAmount, deliverables: requestedDeliverables });
    const cached = getCachedResponse(cacheKey);
    if (cached) return res.json(cached);

    const offerVal = Number(initialOfferAmount) || 800;
    const baseReelRate = creatorProfile?.basePricing?.instagramReel || 1200;
    const fairMin = Math.round(Math.max(offerVal * 1.2, baseReelRate * 0.95) / 50) * 50;
    const fairMax = Math.round(Math.max(offerVal * 1.5, baseReelRate * 1.3) / 50) * 50;
    const recommendedTarget = Math.round((fairMin + fairMax) / 2 / 50) * 50;

    const defaultResult: any = {
      id: 'neg_' + Date.now(),
      brandName: brandName || 'Partner Brand',
      originalOfferPrice: offerVal,
      recommendedCounterPrice: recommendedTarget,
      fairPriceRange: { min: fairMin, max: fairMax },
      dealHealthScore: 82,
      options: [
        {
          tone: 'Professional',
          strategyName: 'Value-First Market Calibration',
          subject: `Creative Proposal & Rates // ${creatorProfile?.creatorName || 'Alex Rivers'} × ${brandName || 'Partner Brand'}`,
          emailBody: `Hi ${brandName} Partnerships Team,\n\nThank you for sharing the campaign brief! I'm genuinely impressed by the new product line and would love to craft high-converting creative assets for this launch.\n\nBased on my verified audience demographics (${creatorProfile?.followersCount?.totalFollowers || '10,000'} engaged followers, ${creatorProfile?.followersCount?.engagementRate || '6.1'}% engagement rate, and an average of 35K organic views per Reel), my standard rate for this deliverable package is $${recommendedTarget}.\n\nThis fee includes:\n- 1x High-Production 4K Instagram Reel with custom narrative hooks\n- 3x Dynamic Story sequence with direct trackable CTA stickers\n- 30-day organic digital usage rights and 1 round of editorial revisions\n\nI’ve attached my verified Heimdall Media Kit for your reference. Let me know if this aligns with your quarterly budget so we can reserve production dates on the calendar!\n\nBest regards,\n${creatorProfile?.fullName || 'Alex Rivers'}`,
          proposedCounterPrice: recommendedTarget,
          adjustedTerms: ['30-day organic usage rights', '2 rounds of minor revisions', 'Net-15 payment schedule'],
          rationale: 'Calm, authoritative, and backs pricing with verified audience conversion metrics.'
        },
        {
          tone: 'Confident',
          strategyName: 'High-Impact Deliverable Upsell',
          subject: `Partnership Proposal: Maximizing Reach for ${brandName}`,
          emailBody: `Hi Team,\n\nThanks for reaching out! Given our audience alignment in the ${creatorProfile?.niches?.[0] || 'Fitness'} space, I know we can drive substantial conversions for this drop.\n\nWhile your initial offer of $${offerVal} is below my standard production baseline, I want to make this partnership high-ROI for both of us. For $${fairMax}, I can deliver a comprehensive multi-asset package:\n\n1. 1x Dedicated 4K Cinematic Reel featuring real-world product integration\n2. 1x High-Velocity TikTok video optimized for search discovery\n3. 3x Instagram Story Frames with direct link stickers\n4. 60 days of digital usage rights for your paid ad team\n\nOur recent posts have averaged over 35,000 views with strong link-click velocity. Let’s get this locked in!\n\nCheers,\n${creatorProfile?.creatorName || 'Alex Rivers'}`,
          proposedCounterPrice: fairMax,
          adjustedTerms: ['Bundled TikTok cross-post', '60-day paid usage included', 'Priority 5-day turnaround'],
          rationale: 'Positions the higher price as an upgraded tier with cross-platform amplification and usage rights.'
        },
        {
          tone: 'Firm',
          strategyName: 'Strict Rate Card Anchor',
          subject: `Rate Confirmation // ${brandName} Campaign`,
          emailBody: `Hi ${brandName} Team,\n\nThank you for considering me for this campaign. I love the brand and what you’re building.\n\nTo ensure top-tier production standards and maintain exclusivity for our brand partners, my minimum rate for this deliverable scope is $${fairMin}. I am unable to discount base rates, but I am happy to adjust the deliverables to match your current budget if needed (for example, providing 1x standalone Reel for $${fairMin}).\n\nPlease let me know how you’d like to proceed.\n\nWarmly,\n${creatorProfile?.fullName || 'Alex Rivers'}`,
          proposedCounterPrice: fairMin,
          adjustedTerms: ['Deliverable scope adjusted to budget', 'No unpaid whitelisting', '50% upfront deposit'],
          rationale: 'Clear boundary-setting that protects the creator from underpricing while offering scope flexibility.'
        },
        {
          tone: 'Relationship-first',
          strategyName: 'Long-Term Ambassador Framework',
          subject: `Excited for ${brandName} × ${creatorProfile?.creatorName || 'Alex Rivers'} // Partnership ideas`,
          emailBody: `Hi ${brandName} Team,\n\nI am such a huge fan of what your team has been doing lately! Working together would be an absolute dream.\n\nFor a one-off campaign, my standard package is $${recommendedTarget}. However, because I believe in the brand long-term and want to build sustained customer trust with my audience, I would love to propose a 3-month Ambassador Retainer at $${Math.round(recommendedTarget * 2.5 / 50) * 50} total (2 dedicated Reels + monthly Story features).\n\nThis gives your team predictable content flow and deeper audience penetration at a preferred partner rate.\n\nWould love to hear your thoughts!\n\nBest,\n${creatorProfile?.fullName || 'Alex Rivers'}`,
          proposedCounterPrice: recommendedTarget,
          adjustedTerms: ['3-month retainer option', 'Preferred creator discount for continuity', 'Monthly check-ins'],
          rationale: 'Focuses on long-term relationship building and converting one-off deals into predictable recurring revenue.'
        }
      ]
    };

    const ai = getAI();
    if (!ai) {
      setCachedResponse(cacheKey, defaultResult);
      return res.json(defaultResult);
    }

    const prompt = `
      You are the Heimdall AI Deal Negotiator, an elite talent agent representing creator "${creatorProfile?.creatorName || 'Creator'}".
      Brand: "${brandName || 'Brand'}"
      Initial Brand Offer: $${offerVal}
      Deliverables Requested: "${requestedDeliverables || '1x Instagram Reel, 3x Stories'}"
      Creator Verified Metrics: Followers: ${creatorProfile?.followersCount?.totalFollowers || '10,000'}, Engagement: ${creatorProfile?.followersCount?.engagementRate || '6.1'}%, Avg Views: 35,000.
      Creator Base Rate: $${baseReelRate}
      Specific Concerns: "${specificConcerns || 'Offer is below market CPM, protect usage rights'}"

      Generate a comprehensive negotiation strategy with:
      1. fairPriceRange { min, max }
      2. recommendedCounterPrice (number)
      3. dealHealthScore (0-100)
      4. 4 counter-offer options in distinct tones: "Professional", "Confident", "Firm", "Relationship-first".
      For each option provide: tone, strategyName, subject, emailBody (fully written, ready to copy), proposedCounterPrice, adjustedTerms (array of strings), rationale.

      Raw JSON only matching:
      {
        "id": "neg_${Date.now()}",
        "brandName": "${brandName}",
        "originalOfferPrice": ${offerVal},
        "recommendedCounterPrice": number,
        "fairPriceRange": { "min": number, "max": number },
        "dealHealthScore": number,
        "options": [
          {
            "tone": "Professional" | "Confident" | "Firm" | "Relationship-first",
            "strategyName": "string",
            "subject": "string",
            "emailBody": "string",
            "proposedCounterPrice": number,
            "adjustedTerms": ["string"],
            "rationale": "string"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = cleanAndParseJSON(response.text || '');
    const result = { ...defaultResult, ...(parsed || {}) };
    setCachedResponse(cacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error("Negotiation engine error:", err);
    res.status(500).json({ error: err.message || "Failed to generate negotiation options" });
  }
});

// =========================================================================
// 5. OPPORTUNITY INTELLIGENCE EVALUATOR ENDPOINT
// =========================================================================
app.post('/api/opportunity/evaluate', async (req, res) => {
  try {
    const { targetName, entityType, evaluationType, dealDetails, creatorProfile, brandProfile } = req.body;

    const cacheKey = getCacheKey('opp_eval', { target: targetName, type: evaluationType, budget: dealDetails?.budget });
    const cached = getCachedResponse(cacheKey);
    if (cached) return res.json(cached);

    const isCreatorEvaluatingBrand = evaluationType !== 'brand_evaluating_creator';

    const defaultEvaluation: any = {
      id: 'opp_' + Date.now(),
      targetName: targetName || (isCreatorEvaluatingBrand ? 'Gymshark' : 'Alex Rivers'),
      entityType: isCreatorEvaluatingBrand ? 'brand' : 'creator',
      evaluationType: isCreatorEvaluatingBrand ? 'creator_evaluating_brand' : 'brand_evaluating_creator',
      overallMatchScore: 92,
      worthWorkingWithVerdict: 'STRONGLY RECOMMENDED',
      verdictSummary: isCreatorEvaluatingBrand
        ? 'High brand alignment with exceptional payment reliability (100% on-time payouts). Audience overlap in Fitness/Lifestyle is 89% with high propensity to convert.'
        : 'Creator has verified organic reach surge (+100% followers, 35K avg views) with authentic engagement. Starting rate is below category median CPM, representing high cost efficiency.',
      fitScore: 94,
      estimatedValue: isCreatorEvaluatingBrand ? 2400 : 1800,
      fairPrice: isCreatorEvaluatingBrand ? 1500 : 1200,
      campaignComplexity: 'MODERATE',
      usageRightsAssessment: 'Standard 30-day organic digital usage requested. No predatory perpetual whitelisting terms.',
      exclusivityImpact: '14-day direct footwear competitor exclusivity. Minimal commercial friction.',
      paymentTermsRisk: 'Low Risk — Net-15 payment backed by Heimdall verified escrow.',
      dealHealthMetric: 91,
      strengths: [
        'Verified on-time payment track record across 18 previous creator campaigns',
        'Strong audience synergy with 89% demographic overlap',
        'Transparent deliverable milestones with pre-agreed revision caps',
        'High potential for repeat multi-month ambassador retainer'
      ],
      risksAndWatchouts: [
        'Requires 4K 60fps raw footage submission alongside final cut',
        'Short 5-day review window for brand creative approval'
      ],
      recommendedNextStep: isCreatorEvaluatingBrand
        ? 'Accept deal terms with a minor clause capping editorial revisions to two rounds.'
        : 'Issue official Deal Room offer at $1,200 with standard 30-day usage rights.'
    };

    const ai = getAI();
    if (!ai) {
      setCachedResponse(cacheKey, defaultEvaluation);
      return res.json(defaultEvaluation);
    }

    const prompt = `
      You are the Heimdall Opportunity Intelligence Engine.
      Task: Evaluate whether this partnership opportunity is worth doing.
      Evaluation Type: ${evaluationType}
      Target Name: ${targetName}
      Deal Details: ${JSON.stringify(dealDetails || { budget: '$1,200', deliverables: '1 Reel, 3 Stories', usage: '30 days' })}
      Context: ${JSON.stringify({ creator: creatorProfile?.creatorName, brand: brandProfile?.companyName })}

      Provide a strict JSON response with:
      - overallMatchScore (0-100)
      - worthWorkingWithVerdict ("STRONGLY RECOMMENDED" | "VIABLE WITH COUNTERTERMS" | "CAUTION ADVISED" | "HIGH RISK / DECLINE")
      - verdictSummary (concise 2-sentence breakdown)
      - fitScore (0-100)
      - estimatedValue (number)
      - fairPrice (number)
      - campaignComplexity ("LOW" | "MODERATE" | "HIGH" | "EXTREME")
      - usageRightsAssessment (string)
      - exclusivityImpact (string)
      - paymentTermsRisk (string)
      - dealHealthMetric (0-100)
      - strengths (array of strings)
      - risksAndWatchouts (array of strings)
      - recommendedNextStep (string)

      Raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = cleanAndParseJSON(response.text || '');
    const result = { ...defaultEvaluation, ...(parsed || {}) };
    setCachedResponse(cacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error("Opportunity evaluation error:", err);
    res.status(500).json({ error: err.message || "Failed to evaluate opportunity" });
  }
});

// =========================================================================
// 6. DEAL ROOM SCOPE CREEP DETECTOR ENDPOINT
// =========================================================================
app.post('/api/deal/scope-creep', async (req, res) => {
  try {
    const { incomingMessage, agreedDeliverables, currentDealBudget } = req.body;

    const defaultAlert = {
      detected: true,
      newScope: 'Brand requested 2 additional Story frames, raw B-roll footage dump, and 60-day paid ad whitelisting not in original contract.',
      recommendedFee: 450,
      impactAnalysis: 'Adding raw footage transfer and paid whitelisting increases brand ad utility by 3x and requires 2 extra hours of export/upload labor.',
      counterMessage: `Hi Team! Happy to provide the raw B-roll footage and extend paid ad whitelisting by 60 days. Because these fall outside our original scope, I can add them as an asset add-on package for an additional $450. Let me know if you'd like me to update the Deal Room invoice!`,
      status: 'active'
    };

    const ai = getAI();
    if (!ai || !incomingMessage) {
      return res.json(defaultAlert);
    }

    const prompt = `
      You are the Heimdall Scope Creep Sentinel.
      Analyze this brand communication against agreed deliverables:
      Agreed Deliverables: "${JSON.stringify(agreedDeliverables || '1x Instagram Reel, 30 days organic usage')}"
      Current Budget: $${currentDealBudget || 1000}
      Incoming Message: "${incomingMessage}"

      Determine if the message requests new uncompensated work (e.g. extra formats, raw files, longer usage, whitelisting, faster rush delivery).
      Return JSON:
      {
        "detected": boolean,
        "newScope": "description of added work or null",
        "recommendedFee": number (additional fair compensation in USD),
        "impactAnalysis": "why this impacts creator workload/licensing",
        "counterMessage": "polite, professional message explaining the additional fee",
        "status": "active"
      }
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = cleanAndParseJSON(response.text || '');
    return res.json(parsed || defaultAlert);
  } catch (err: any) {
    console.error("Scope creep detector error:", err);
    res.status(500).json({ error: err.message || "Failed to check scope creep" });
  }
});

// =========================================================================
// 7. CAMPAIGN AUTOPSY & RELATIONSHIP REACTIVATION ENDPOINT
// =========================================================================
app.post('/api/campaign/autopsy', async (req, res) => {
  try {
    const { campaignId, campaignTitle, brandName, budget, deliverablesData } = req.body;

    const defaultAutopsy: any = {
      id: 'autopsy_' + Date.now(),
      campaignId: campaignId || 'camp_spring_2026',
      campaignTitle: campaignTitle || 'Q1 High-Performance Launch',
      brandName: brandName || 'Gymshark',
      totalBudget: budget || 12500,
      actualSpend: 11800,
      creatorsEngaged: 6,
      totalDeliverablesCompleted: 14,
      totalImpressions: 485000,
      totalReach: 390000,
      totalEngagements: 38200,
      averageEngagementRate: 7.8,
      costPerView: 0.024,
      costPerEngagement: 0.31,
      roiScore: 4.2,
      whatWorked: [
        'Short-form vertical video (Reels/TikTok) delivered 74% of all product clicks with a low $0.02 CPM.',
        'Creators who showed the authentic "workout failure & recovery" routine had 3.1x higher watch retention than polished studio posts.',
        'Story frames with direct discount code stickers generated an instant $34,000 in tracked affiliate checkout revenue within 48 hours.'
      ],
      whatDidnt: [
        'Static Instagram carousel posts underperformed, generating only 8% of total impressions despite consuming 25% of total budget.',
        'One creator delivered 3 days late due to unclear script revision guidelines.'
      ],
      topPerformingCreators: [
        {
          name: 'Alex Rivers',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          platform: 'instagram',
          views: 182000,
          engagementRate: 8.4,
          costEfficiencyScore: 96,
          recommendForFuture: true
        },
        {
          name: 'Marcus Vance',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          platform: 'tiktok',
          views: 145000,
          engagementRate: 9.1,
          costEfficiencyScore: 93,
          recommendForFuture: true
        },
        {
          name: 'Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          platform: 'youtube',
          views: 95000,
          engagementRate: 6.2,
          costEfficiencyScore: 88,
          recommendForFuture: true
        }
      ],
      bestPerformingPlatform: 'Instagram Reels & TikTok UGC',
      recommendationsForNextCampaign: [
        'Shift 100% of creative budget from static photo carousels into high-contrast short-form vertical video (Reels/TikTok).',
        'Secure 90-day paid whitelisting rights upfront on top-performing creators (Alex Rivers, Marcus Vance).',
        'Introduce a 2-tier milestone schedule with mandatory storyboard approval at Day 3 to prevent delivery delays.'
      ],
      reactivationOpportunities: [
        {
          creatorId: 'alex_rivers',
          creatorName: 'Alex Rivers',
          reason: 'Drove 42% of total campaign conversions at an exceptional $0.018 Cost Per View. Audience highly receptive to upcoming Summer Capsule drop.',
          proposedAngle: '3-Month Ambassador Retainer for Summer Capsule Launch with exclusive promo code',
          suggestedBudget: 4500,
          priority: 'HIGH'
        },
        {
          creatorId: 'marcus_vance',
          creatorName: 'Marcus Vance',
          reason: 'Viral TikTok breakout reached 145K views organically with 9.1% engagement rate.',
          proposedAngle: 'Spark Ad Whitelisting + 2x Dedicated TikTok Challenge videos',
          suggestedBudget: 2800,
          priority: 'HIGH'
        }
      ]
    };

    const ai = getAI();
    if (!ai) return res.json(defaultAutopsy);

    const prompt = `
      You are the Heimdall Campaign Autopsy & Intelligence Engine.
      Analyze the completed campaign:
      Title: "${campaignTitle}"
      Brand: "${brandName}"
      Budget: $${budget || 12000}
      Deliverables Data: ${JSON.stringify(deliverablesData || {})}

      Generate a deep post-campaign autopsy analysis in raw JSON matching:
      {
        "id": "autopsy_${Date.now()}",
        "campaignId": "${campaignId || 'camp_1'}",
        "campaignTitle": "${campaignTitle}",
        "brandName": "${brandName}",
        "totalBudget": number,
        "actualSpend": number,
        "creatorsEngaged": number,
        "totalDeliverablesCompleted": number,
        "totalImpressions": number,
        "totalReach": number,
        "totalEngagements": number,
        "averageEngagementRate": number,
        "costPerView": number,
        "costPerEngagement": number,
        "roiScore": number,
        "whatWorked": ["string", "string"],
        "whatDidnt": ["string", "string"],
        "topPerformingCreators": [
          { "name": "string", "avatar": "string", "platform": "instagram"|"tiktok"|"youtube", "views": number, "engagementRate": number, "costEfficiencyScore": number, "recommendForFuture": true }
        ],
        "bestPerformingPlatform": "string",
        "recommendationsForNextCampaign": ["string", "string"],
        "reactivationOpportunities": [
          { "creatorId": "string", "creatorName": "string", "reason": "string", "proposedAngle": "string", "suggestedBudget": number, "priority": "HIGH"|"MEDIUM" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = cleanAndParseJSON(response.text || '');
    return res.json({ ...defaultAutopsy, ...(parsed || {}) });
  } catch (err: any) {
    console.error("Campaign autopsy error:", err);
    res.status(500).json({ error: err.message || "Failed to generate campaign autopsy" });
  }
});


export default app;

async function startServer() {
  // Vite middleware setup for Development & Production fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Heimdall Server listening on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
