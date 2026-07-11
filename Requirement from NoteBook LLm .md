




# overview 

Challenge 4 Build Guide: Smart Stadiums & Tournament Operations

1. Challenge Overview and the "Vibe Coding" Philosophy

"PromptWars Virtual" represents a fundamental shift in software engineering. We are moving from syntax-heavy manual coding to Vibe Coding—an intent-driven development model where AI-assisted orchestration allows you to build real-world applications at the speed of thought.

The Theme: Smart Stadiums & Tournament Operations. You are tasked with treating a major stadium (e.g., a FIFA World Cup venue) as a "temporary city." Your goal is to utilize Generative AI to ensure this city runs smoothly for the few hours it exists.

Mandatory Submission Requirements

To secure a place on the leaderboard, your submission must include:

* Deployment Link: A URL to a fully functional, live project.
* LinkedIn Documentation: A post detailing your architectural strategy, tool selection, and prompt evolution.

The "Latest Count" Rule

You are permitted a maximum of three submission attempts. Caution: The evaluation system only recognizes your latest submission. If your first attempt scores a 90 and your third attempt scores a 60, your final recorded score is 60. Manage your attempts with technical maturity.

2. Strategic Foundation: Persona and Vertical Selection

The key to a high-scoring project is Depth over Breadth. Avoid building a "Swiss Army Knife" app that solves everything poorly. Instead, select one primary persona and engineer a specialized, high-utility solution.

Target Personas and Implementable Solutions

Persona	High-Level Pain Points	Architect's Focus
Fans	Navigation bottlenecks, language barriers, dietary-specific concessions.	Reducing friction in the "last mile" of the fan experience.
Organizers	Crowd safety, gate capacity management, real-time logistics.	Operational intelligence and risk mitigation.
Volunteers	Multilingual communication, lack of venue-specific training.	Real-time assistance and "Co-pilot" tools.
Venue Staff	Medical response coordination, sanitation prioritization.	Dispatch efficiency and real-time decision support.

Technical Verticals: From Jargon to Architecture

Select 1-2 verticals to combine with your persona. Do not attempt all eight.

* Navigation: Go beyond a basic map. Implement reasoning—e.g., "Redirect to Gate D because Gate C has reached a 15-minute bottleneck."
* Crowd Management: Use computer vision data (synthetic) to drive GenAI reasoning for gate redirections and push notifications.
* Sustainability: Architect's Idea: "Smart Bins" that notify cleaning crews based on fill-levels rather than fixed-time rounds, optimizing staff labor.
* Transportation: Architect's Idea: Last-mile connectivity tools that predict demand for shuttle services when 40,000 people exit a metro station simultaneously.

3. Implementing Explainable AI (XAI) and Reasoning

Usage of GenAI is mandatory, but "if-else" logic is not enough. The judges are evaluating Reasoning and Generation.

The "Volunteer Co-pilot" Case Study

To understand Explainable AI (XAI), consider a tool for a stadium volunteer. Instead of simply reporting crowd numbers, the AI follows an Input -> Reasoning -> Action loop:

1. Input: Real-time data shows Gate C is at 80% capacity.
2. Reasoning: The AI predicts that at current arrival rates, Gate C will bottleneck in 5 minutes, creating a safety risk.
3. Action: The AI generates a script in the volunteer’s local language and a broadcast message in Spanish/French to redirect fans to Gate D.

XAI is the AI's ability to explain why it recommended Gate D over Gate C, providing plain English justifications for the operations control room.

4. Technical Architecture: Google Services Integration

To maximize the "Google Services" scoring parameter, using the "Anti-gravity" IDE alone is insufficient. You must hook into broader Google Cloud Platform (GCP) services.

Recommended Integration Stack

* Vertex AI / AI Studio: Use these for model orchestration and advanced prompt tuning.
* Google Cloud Run: Highly Recommended. Deploy your backend here to demonstrate scalable orchestration.
* Firebase: For real-time database updates (e.g., crowd density) and user authentication.
* Google Maps API: Essential for any navigation-based solution.
* Note on Google Ads: While an eligible service, prioritize the above for core functionality.

5. Prompt Engineering Best Practices

Your prompts must be structured to "read between the lines." This is critical for distinguishing between standard requests and emergencies.

1. System Instructions: Define the persona and its constraints (e.g., "You are an emergency response coordinator").
2. User Instructions: The specific query or data point.
3. Few-shot Examples: Provide 2-3 examples of how to handle nuances. Example: A fan asking for a restroom for standard use vs. a fan asking for a restroom due to a medical emergency. The AI must detect this context and escalate if necessary.
4. JSON Output Formats: Ensure your AI returns structured data so your frontend can programmatically trigger UI changes or notifications.

6. Scoring Optimization: Efficiency and Testing

Code Quality & Technical Maturity

Do not write thousands of lines of redundant code. The automated assessment looks for Efficiency.

* The Metaphor: If searching a sorted list, a Linear Search (O(n)) is less efficient than a Binary Search (O(log n)).
* Action: In your LinkedIn post, document why you chose specific data structures. Optimizing for time and space complexity shows the "Senior Architect" mindset.

Testing for Edge Cases

A major score-killer is failing to handle non-standard scenarios. Test for:

* Dialectal Nuance: Ensure a fan from Morocco receives a response in an appropriate Arabic register, rather than a stiff, formal translation that adds stress.
* Contextual Sensitivity: Your app should handle a "medical emergency" differently than a "lost ticket" query.

Data Management: The "Test Bed" Strategy

Since you lack live stadium data, use synthetic data for your demo. However, to earn top marks, provide a Test Bed (a CSV or PDF upload feature). This allows judges to input their own data to verify that your GenAI logic is truly functional and not hard-coded for a single scenario.

7. Submission Excellence and Final Checklist

The LinkedIn Post

Your documentation is as important as your code. Detail your Prompt Evolution:

* What did the AI handle automatically?
* What did you design manually to ensure "Cost Optimization"?
* How did your prompts change when you encountered edge cases?

Pre-Submission Checklist

* [ ] GenAI Logic: Are responses reasoned or just "if-else" triggers?
* [ ] No Static Pages: Is the application fully "Vibe Coded"?
* [ ] API Keys: Have you verified that all keys are functional for the jury?
* [ ] Context Check: Does the tool distinguish between a standard fan and a medical emergency?
* [ ] GCP Integration: Are you using more than just Anti-gravity (e.g., Firebase, Cloud Run)?

The Reward System: Prompt Credits (PC)

Consistency on the leaderboard compounds your rewards throughout the year. Note the following values from the official Swag Store:

* Cap: 21.25 PC
* T-Shirt: 3,625 PC
* Hoodie: 5,000 PC
* Premium Backpack: 11,000 PC
* Expiry: Credits expire on January 1st, 2027. Consistent participation in the top 400 is the most effective path to high-tier rewards.


Challenge 4 Guide: Smart Stadiums and Tournament Operations

1. Program Overview: PromptWars Virtual

PromptWars Virtual is a high-intensity, bi-weekly development cycle designed for individual developers in India. At its core, the program represents a shift from traditional manual labor to VIP Coding—a framework where software is built through intent and orchestration rather than brute-force syntax.

The VIP Coding Philosophy

* Syntax to Intent: Transitioning from writing every line of code to describing high-level objectives and outcomes.
* Orchestration: Utilizing advanced AI tools—including AI Studio, Replit, Anti-gravity, Vortex AI, and Gemini—to connect services and manage complex application logic.
* Building in Public: Validating technical expertise through content, documenting strategy and tool evolution to ensure genuine learning.

The Challenge Cycle & Leaderboard

Unlike isolated hackathons, PromptWars Virtual features a cumulative leaderboard that rewards consistency over a full year.

Feature	Protocol
Frequency	Bi-weekly (every 14 days)
Participation	Individual participation only (no teams allowed)
Leaderboard	Cumulative annual scoring based on quality and consistency
Mandatory Submission	Functional deployment link + LinkedIn strategy post

2. Challenge 4 Theme: Smart Stadiums

The mission for Challenge 4 is to architect solutions for the FIFA World Cup 2026. In this context, stadiums are viewed as "Temporary Cities"—complex infrastructures built and operated for short, intense bursts before being repurposed. Your goal is to use GenAI to make this temporary city run smoothly for everyone within it.

Persona Analysis: Identify Your Target

To succeed, you must solve a specific pain point for ONE of the following personas. Attempting to solve for multiple personas usually results in shallow, low-scoring utility.

* Fans: Navigating language barriers, locating specific gates, or finding specialized dietary options (vegan, gluten-free) in a chaotic 90,000-person environment.
* Organizers: Managing high-stakes safety bottlenecks (e.g., 12,000 people at Gate C) where a 4-minute delay in decision-making becomes a security risk.
* Volunteers: Typically 18-20 year-olds directing 4,000 people with a megaphone, struggling to communicate with fans speaking Spanish or Portuguese without knowing the local dialect.
* Venue Staff: Security, cleaning crews, and medical responders who must transition from routine tasks to real-time incident response.

The Power of "Or": You are explicitly required to select one persona and dive deep into their specific operational reality.

3. Core Verticals & Problem Statements

Participants must select one or two verticals from the list below to build their solution.

* Navigation: Providing reasoning-based route guidance that avoids crowd bottlenecks using real-time data.
* Crowd Management: Analyzing CCTV and swipe data to generate plain-English recommendations for operations control rooms.
* Accessibility: Designing step-free routes for wheelchair users or real-time captioning for stadium announcements to support deaf fans.
* Transportation: Predicting "last mile" demand to dynamically reload shuttles for 40,000+ people exiting transit hubs.
* Sustainability: Monitoring real-time bin fill levels to reroute cleaning crews dynamically rather than following fixed rounds (Strategic Tip: This is an underused vertical and a major opportunity to stand out).
* Multilingual Assistance: Detecting specific dialects and social registers (e.g., Moroccan Arabic vs. Formal Arabic) to deliver culturally appropriate support.
* Operational Intelligence: Building back-office dashboards for predictive staffing and tournament-wide resource allocation.
* Real-time Decision Support: Transforming raw data streams into actionable reasoning layers for high-pressure stadium control rooms.

Technical Deep-Dives: Basic vs. Advanced Implementations

Vertical	Basic (Low Score)	Advanced (High Score)
Navigation	A static map with a standard chatbot.	Crowd-aware routing that explains the reasoning (e.g., "Take Route B to avoid the Gate C bottleneck").
Crowd Management	Simple headcount/density detection.	XAI-driven alerts (e.g., "Gate C at 85%; redirect fans to Gate D") with multi-language push notifications.
Multilingual	Generic call to a translation API.	Dialect-aware translation that distinguishes Contextual Tone (e.g., a fan needing a bathroom for a medical emergency vs. a general inquiry).
Sustainability	Fixed cleaning rounds for staff.	AI-driven prioritization of cleaning routes based on real-time bin capacity and fan density.

4. System Constraints & Mandatory GenAI Logic

Generative AI integration is not optional. Every submission must demonstrate fully functional AI logic.

Explainable AI (XAI) and Reasoning

Your project must implement a Reasoning Layer. It is not enough to output data; the system must provide "plain English recommendations for the ops control room." The evaluator will look for the why behind every AI action.

Mandatory Constraints

* No Static/Hard-coded Pages: The application must be "vibe-coded" and dynamic.
* Functional Accuracy: No false positives or repetitive AI responses.
* Dynamic Data: Use public APIs or synthetic data. Do not hard-code results.
* Vibe Coding Logic: The transition from Input to Reasoning to Action must be evident in the architecture.

Mandatory Deliverables

1. Deployment Link: A live URL (Vercel, Netlify, Render, or Google Cloud Run).
2. LinkedIn Post: A deep dive into tool choice (e.g., why you chose Vortex AI over others), prompt evolution, and a breakdown of what the AI handled vs. what you designed.

5. Architectural Optimization for Leaderboard Gains

Submissions undergo automated assessment across Code Quality, Security, Efficiency, Testing, Accessibility, and Alignment.

Algorithmic Efficiency

Code quality is judged on optimization. For example, if searching through a sorted array of stadium gate data, a Binary Search (O(log n)) will significantly outscore a Linear Search (O(n)). Avoid "bloated" code; 1,000 lines of highly optimized logic is superior to 5,000 lines of unoptimized syntax.

Google Services Integration

To maximize your score in the "Google Services" parameter, integrate the following:

* GCP Services: Firebase, Cloud Run, or Firehole.
* APIs: Google Maps API for navigation or Google Ads for fan engagement.

The Three-Attempt Rule

You are granted three submission attempts per challenge. Only the latest attempt counts. If your second attempt scores 95 but your third attempt scores 60, your final leaderboard score is 60.

6. Sample Project Blueprint: The Volunteer Co-Pilot

Target Persona: Volunteer | Verticals: Crowd Management + Multilingual Assistance

1. Input: The system ingests live density data. Gate C crosses an 80% capacity threshold.
2. Reasoning (The AI Layer): The AI predicts Gate C will hit 100% within minutes. It analyzes fan demographics and identifies that a large group of Spanish speakers is approaching. It determines that a standard redirected instruction is insufficient and identifies a medical urgency in a sub-group's query.
3. Action: The Co-Pilot generates a specific script for the volunteer in Spanish and French. It adjusts the tone based on context—providing a calm, prioritized instruction for the medical inquiry while giving standard redirection for others.

7. Rewards, Credits, and the Swag Store

The program uses Prompt Credits (PC). Credits scale based on your rank among the top 400 participants.

Credit Rewards by Rank

Rank	Credits per Challenge
Rank 1	5,000 PC
Rank 2	4,500 PC
Rank 3	4,000 PC
Ranks 4 - 10	1,600 - 3,500 PC
Ranks 11 - 50	1,200 - 1,500 PC
Ranks 100 - 400	500 - 900 PC

Compound Earnings Example: Consistency is key. If you rank at #20 for 6 consecutive challenges, you earn approximately 1,400 PC per challenge, totaling 8,400 PC.

The Swag Store: Redemption

* Caps: 21.25 PC
* T-shirts: 3,625 PC
* Hoodies: 5,000 PC
* Premium Backpacks: 11,000 PC

Deadline: All credits expire on January 1, 2027.

8. Submission Checklist & Final Reminders

Before hitting submit, verify your project against these criteria:

* [ ] Functional GenAI: Does the AI provide reasoned, unique responses without repetition?
* [ ] API Stability: Have you verified that your API keys are active for the manual/functional review?
* [ ] XAI Layer: Does the application provide plain-English reasoning for its decisions?
* [ ] Contextual Tone: In multilingual/volunteer apps, does the AI distinguish between different registers and social contexts (e.g., medical emergency vs. standard inquiry)?
* [ ] Architectural Efficiency: Is the code optimized for time/space complexity (e.g., O(log n) vs O(n))?
* [ ] Google Services: Have you integrated GCP components like Firebase, Cloud Run, or Maps?
* [ ] Public Deployment: Is the project live on a accessible platform (Vercel, Netlify, Render, etc.)?
* [ ] LinkedIn Strategy: Does your post explain why you chose specific tools and how your prompts evolved?
