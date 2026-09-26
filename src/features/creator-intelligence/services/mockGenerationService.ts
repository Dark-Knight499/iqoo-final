import { GeneratedContent, CopilotMessage, DraftChange, GenerationInput } from '../types/creatorIntelligence';

const defaultDraft: GeneratedContent = {
  id: 'draft-1',
  title: 'The Future of AI Is On Your Phone',
  hook: 'Your phone is about to become smarter than most cloud AI workflows.',
  coreMessage: 'On-device AI chips and small language models are democratizing private, instant creator workflows directly in your pocket without cloud latency or subscription costs.',
  script: "Welcome to the new era of mobile intelligence. In this video, we'll dive deep into how on-device AI is revolutionizing the way we create, work, and interact with our devices. No more waiting for cloud processing, no more privacy concerns. Everything happens right in your pocket. From real-time speech-to-text to instantaneous neural video reframing, the power is now truly in your hands. Hardware advancements like dedicated NPUs make running 7B parameter models on your phone feel like magic. It's not just a convenience upgrade; it's a fundamental shift in computing autonomy. The future isn't in a distant data center miles away; it's running right here on your phone. Are you ready to unlock its full potential?",
  scenes: [
    {
      id: 'sc-1',
      label: 'Scene 1: The Hook',
      duration: '0-4s',
      visual: 'Creator holding smartphone directly toward camera with glowing neural overlay on screen.',
      dialogue: 'Your phone is about to become smarter than most cloud AI workflows.',
      camera: 'Close-up / Macro eye contact',
      movement: 'Slow push-in'
    },
    {
      id: 'sc-2',
      label: 'Scene 2: Latency Contrast',
      duration: '4-12s',
      visual: 'Split screen comparison: Left side showing a spinning cloud loading indicator, right side showing instantaneous local AI transcription.',
      dialogue: 'No more waiting for remote server queues or monthly cloud API fees. Everything runs locally at 60 frames per second.',
      camera: 'Medium shot / Split display',
      movement: 'Static with crisp UI punch-in'
    },
    {
      id: 'sc-3',
      label: 'Scene 3: Real-World Workflow',
      duration: '12-22s',
      visual: 'Over-the-shoulder perspective of mobile video editing with AI object tracking and automatic subtitle sync happening in airplane mode.',
      dialogue: 'Imagine cutting an entire 4K reel, generating voice-matched captions, and reframing aspect ratios with zero internet connection.',
      camera: 'Over-the-shoulder 45 degree',
      movement: 'Gentle handheld orbit'
    },
    {
      id: 'sc-4',
      label: 'Scene 4: Call to Action',
      duration: '22-30s',
      visual: 'Creator looks back to camera, holding phone upright as the app export finishes in 1.2 seconds.',
      dialogue: 'Stop relying solely on cloud servers. Try building your next AI workflow locally.',
      camera: 'Medium close-up',
      movement: 'Quick zoom out with graphic badge pop'
    }
  ],
  visualDirection: {
    camera: 'Close-up / medium shot with shallow depth of field (f/1.8)',
    movement: 'Smooth cinematic push-ins with dynamic handheld punch-ins for emphasis',
    lighting: 'Cool cyber-minimalist with subtle neon accent edge-lighting'
  },
  broll: [
    'Macro shot of smartphone titanium frame and NPU chip architecture graphics',
    'Airplane mode toggle showing AI tools still functioning offline',
    'Real-time neural audio waveform sync visualization',
    'Fast-paced montage of creator cutting reels on a commute train'
  ],
  music: {
    genre: 'Energetic Electronic / Cyber Ambient',
    bpm: 124
  },
  cta: 'Try building your next AI workflow locally. Download the local studio kit below!'
};

export const generationService = {
  async generate(input: GenerationInput): Promise<GeneratedContent> {
    // Simulate real AI processing latency
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    // Tailor content title & format based on input
    const generated = JSON.parse(JSON.stringify(defaultDraft)) as GeneratedContent;
    generated.id = `gen-${Date.now()}`;
    
    if (input.contentType === 'reel' || input.contentType === 'short-video') {
      generated.title = 'Why Local AI Beats the Cloud in 2025';
      generated.hook = 'Stop paying cloud subscriptions when your phone has an NPU.';
    } else if (input.contentType === 'linkedin-post') {
      generated.title = 'The Architectural Shift from Cloud to Edge AI';
      generated.hook = 'The biggest misconception in enterprise AI right now is that bigger models always win.';
      generated.script = '3 reasons why on-device computing will dominate 2025:\n\n1. Zero data egress liability (GDPR compliant by design)\n2. Sub-50ms deterministic inference\n3. Zero marginal inference costs for end consumers\n\nAre you building for server racks or edge silicon?';
    }

    if (input.tone === 'cinematic') {
      generated.visualDirection.lighting = 'High contrast teal & amber chiaroscuro lighting';
      generated.visualDirection.camera = 'Anamorphic 35mm with vintage streak flares';
    } else if (input.tone === 'energetic') {
      generated.music = { genre: 'High-BPM Hyperpop Glitch', bpm: 138 };
    }

    return generated;
  },

  async chat(userMessage: string, currentDraft: GeneratedContent): Promise<{ response: CopilotMessage; updatedDraft: GeneratedContent }> {
    await new Promise(resolve => setTimeout(resolve, 700));

    const msg = userMessage.toLowerCase();
    const updatedDraft: GeneratedContent = JSON.parse(JSON.stringify(currentDraft));
    const changes: DraftChange[] = [];
    let responseText = "I've reviewed your request and updated the draft accordingly.";

    if (msg.includes('controversial') || msg.includes('stronger hook')) {
      const oldHook = currentDraft.hook;
      updatedDraft.hook = 'Your phone is about to make your expensive cloud AI subscriptions completely obsolete.';
      changes.push({
        field: 'Hook',
        before: oldHook,
        after: updatedDraft.hook
      });
      responseText = "Updated the hook to create a sharper tension and challenge conventional wisdom. This will significantly increase the stop-rate in the first 3 seconds.";
    } else if (msg.includes('shorter') || msg.includes('concise')) {
      const oldHook = currentDraft.hook;
      updatedDraft.hook = 'Cloud AI is officially obsolete. Look at your phone.';
      changes.push({
        field: 'Hook',
        before: oldHook,
        after: updatedDraft.hook
      });
      responseText = "Trimmed the hook down to just 9 words for punchy, high-retention delivery.";
    } else if (msg.includes('style') || msg.includes('my usual style') || msg.includes('conversational')) {
      const oldScript = currentDraft.script;
      updatedDraft.script = "Alright, quick reality check. Everyone is obsessing over massive cloud servers, but what if I told you the best AI model you'll use today is already sitting inside your pocket? Let me show you what happens when you run a 7B model completely offline.";
      changes.push({
        field: 'Script Tone',
        before: oldScript.slice(0, 70) + '...',
        after: updatedDraft.script.slice(0, 70) + '...'
      });
      responseText = "Adapted the voice to your natural creator tone: conversational, direct, and authentic.";
    } else if (msg.includes('cinematic')) {
      const oldLighting = currentDraft.visualDirection.lighting;
      updatedDraft.visualDirection = {
        camera: 'Anamorphic 35mm focal length, f/1.4 aperture',
        movement: 'Slow dynamic push-in with subtle handheld parallax drift',
        lighting: 'Dark cinematic with intense rim-lighting and glowing cyan accent key'
      };
      changes.push({
        field: 'Visual Direction',
        before: oldLighting,
        after: updatedDraft.visualDirection.lighting
      });
      responseText = "Elevated the visual treatment to high-end cinematic standards with anamorphic framing and atmospheric neon backlights.";
    } else if (msg.includes('cta') || msg.includes('call to action')) {
      const oldCta = currentDraft.cta;
      updatedDraft.cta = 'Comment "LOCAL" and I will send you the exact offline AI stack I run on this device.';
      changes.push({
        field: 'Call to Action',
        before: oldCta,
        after: updatedDraft.cta
      });
      responseText = "Replaced the CTA with an interactive keyword trigger that drives comments and algorithm velocity.";
    } else if (msg.includes('visual') || msg.includes('scene 2') || msg.includes('second scene')) {
      const oldVisual = currentDraft.scenes[1]?.visual || '';
      if (updatedDraft.scenes.length > 1) {
        updatedDraft.scenes[1].visual = 'Macro extreme close-up of fingers interacting with on-device AI slider, with ambient particle effects reflecting on the screen glass.';
        updatedDraft.scenes[1].movement = 'Whip-pan transition into microscopic macro';
        changes.push({
          field: 'Scene 2 Visuals',
          before: oldVisual,
          after: updatedDraft.scenes[1].visual
        });
      }
      responseText = "Enhanced Scene 2 with an extreme macro perspective to heighten visual engagement and tactile feel.";
    } else if (msg.includes('reel') || msg.includes('30 second') || msg.includes('30s')) {
      const oldScript = currentDraft.script;
      updatedDraft.script = "Cloud AI is slow. Your phone is not. Watch this: speech-to-text, 4K upscale, instant script generation—all in airplane mode. The AI revolution isn't in a server farm. It's in your hand.";
      updatedDraft.scenes = updatedDraft.scenes.slice(0, 3);
      changes.push({
        field: 'Pacing & Duration',
        before: '60s Longform draft',
        after: '30s High-velocity Reel cut (3 scenes)'
      });
      responseText = "Pivoted draft to a rapid-fire 30-second Reel structure with immediate visual payoff.";
    } else {
      responseText = `I analyzed your direction "${userMessage}". I can help you tweak the Hook, convert to a 30s Reel format, inject your creator tone, craft a stronger CTA, or enrich the visual storyboard direction. Which area should we sharpen?`;
    }

    const aiMessage: CopilotMessage = {
      id: `copilot-${Date.now()}`,
      role: 'ai',
      text: responseText,
      timestamp: Date.now(),
      changes: changes.length > 0 ? changes : undefined
    };

    return {
      response: aiMessage,
      updatedDraft
    };
  }
};
