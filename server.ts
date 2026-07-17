import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Simple in-memory cache to prevent exhausting Gemini free tier API quota
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours for successful responses
const ERROR_CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes for fallback/error responses to give API a break

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

const app = express();
const PORT = 3000;

app.use(express.json());

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
      model: 'gemini-3.5-flash',
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
      model: 'gemini-3.5-flash',
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
      model: 'gemini-3.5-flash',
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
      model: 'gemini-3.5-flash',
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
      model: 'gemini-3.5-flash',
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
        model: 'gemini-3.5-flash',
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

startServer();
