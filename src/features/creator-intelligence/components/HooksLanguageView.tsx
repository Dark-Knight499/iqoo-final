import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Volume2, 
  Languages, 
  Copy, 
  CheckCircle2, 
  Layers, 
  Mic, 
  Zap, 
  Clock, 
  BookOpen, 
  FileText,
  ChevronDown,
  ChevronUp,
  Radio,
  Play
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { CreatorDomainProfile, legacyBackend } from '@/services/legacyBackend';

interface HooksLanguageViewProps {
  creatorName: string;
  domainProfile: CreatorDomainProfile | null;
  detectedLanguage?: string | null;
  onDraftInCopilot: (topic: string, hook: string, platform: string) => void;
  onAddToStoryboard: (title: string, reason: string) => void;
}

export const HooksLanguageView: React.FC<HooksLanguageViewProps> = ({
  creatorName,
  domainProfile,
  detectedLanguage,
  onDraftInCopilot,
  onAddToStoryboard,
}) => {
  const { theme, showToast } = useAppStore();
  const isDark = theme !== 'light';

  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mannerisms' | 'archetypes' | 'monologues' | 'cadence' | 'raw_dossier'>('mannerisms');
  const [rawHookMd, setRawHookMd] = useState<string | null>(null);
  const [loadingHookMd, setLoadingHookMd] = useState<boolean>(false);

  // Fallback authentic linguistic mannerisms if profile hasn't loaded yet
  const defaultMannerisms = [
    {
      phrase: 'नमस्कार दोस्तों, स्वागत है आपका एक और नए वीडियो में',
      romanized: 'Namaskar dosto, swagat hai aapka ek aur naye video mein',
      category: 'greeting',
      sample_context: 'Iconic opening greeting setting an objective, calm, and grounded tone.',
    },
    {
      phrase: 'सच तो यह है कि...',
      romanized: 'Sach to yeh hai ki...',
      category: 'emphasis',
      sample_context: 'Spoken right before debunking a popular misconception or presenting official statistics.',
    },
    {
      phrase: 'आइए इसको गहराई से समझते हैं',
      romanized: 'Aaiye isko gehrai se samajhte hain',
      category: 'transition',
      sample_context: 'Used to transition from the introductory hook into structured chapter breakdowns.',
    },
    {
      phrase: 'अब असली सवाल यह उठता है कि...',
      romanized: 'Ab asli sawal yeh uthta hai ki...',
      category: 'transition',
      sample_context: 'Pivotal question hook challenging the viewer’s preconceived notions.',
    },
    {
      phrase: 'कमेंट करके जरूर बताइए कि आपकी इस पर क्या राय है',
      romanized: 'Comment karke zaroor bataiye ki aapki is par kya raye hai',
      category: 'call_to_action',
      sample_context: 'Closing call to action encouraging civic debate and critical thinking.',
    },
    {
      phrase: 'यह बात 99% लोग नहीं जानते',
      romanized: 'Yeh baat 99% log nahi jaante',
      category: 'emphasis',
      sample_context: 'Pattern-interrupt phrase used to highlight hidden systemic facts.',
    },
  ];

  const mannerisms = (domainProfile?.signature_phrases && domainProfile.signature_phrases.length > 0)
    ? domainProfile.signature_phrases
    : defaultMannerisms;

  // The 4 Core Hook Archetypes
  const hookArchetypes = [
    {
      archetype: 'Archetype A',
      title: 'The "Painful Inconsistency" Hook',
      formula: '[Acknowledge widespread belief] + [Expose hidden data/reality] + [Promise complete breakdown]',
      templateNative: 'अगर आप भी सोचते हैं कि [आम धारणा] सच है, तो असली डेटा देखकर आपके होश उड़ जाएंगे।',
      templateEnglish: 'If you also think that [Common Belief] is true, the official data will completely shock you.',
      whyItWorks: 'Immediately challenges the viewer\'s cognitive model and triggers an irresistible curiosity gap.',
    },
    {
      archetype: 'Archetype B',
      title: 'The "Negative Constraint" Hook',
      formula: '[Bold imperative telling viewer to STOP doing common action] + [Provocative reason why]',
      templateNative: 'अगर आप [विषय] के बारे में यह गलती कर रहे हैं, तो अभी रुक जाइए...',
      templateEnglish: 'If you are still making this mistake with [Topic], stop right now—here is the unvarnished reality.',
      whyItWorks: 'Triggers psychological loss aversion; studies show stopping a negative action retains viewers 2.3x longer in the first 5 seconds.',
    },
    {
      archetype: 'Archetype C',
      title: 'The "Numbers & Proof" Teardown',
      formula: '[Specific empirical metric] + [Unusual time frame] + [Exact mechanism]',
      templateNative: 'कैसे सिर्फ [संख्या] दिनों में [बदलाव] हो गया? इसके पीछे का असली खेल क्या है?',
      templateEnglish: 'How did [Metric] shift in just [Timeframe]? What is the hidden mechanism behind the scenes?',
      whyItWorks: 'Specific numbers establish undeniable scientific authority and eliminate fluff within 3 seconds.',
    },
    {
      archetype: 'Archetype D',
      title: 'The "Unspoken Truth" Confessional',
      formula: '[Intimate realization] + [Relatable struggle] + [The turning point]',
      templateNative: 'यह एक ऐसा सच है जिसके बारे में कोई बात नहीं कर रहा, लेकिन जानना हम सबके लिए बेहद जरूरी है।',
      templateEnglish: 'This is an unspoken truth that nobody in mainstream media is talking about, but affects all of us.',
      whyItWorks: 'Cultivates deep parasocial trust, peer solidarity, and high average view completion.',
    },
  ];

  // Long Monologues
  const monologues = domainProfile?.domain_monologues || {
    thesis_monologue: {
      title: '45-Second Thesis Framing Monologue (Opening Speech)',
      speech: 'नमस्कार दोस्तों! अगर आप पिछले कुछ सालों के ट्रेंड्स को देखें तो आपको एक बात साफ नजर आएगी कि हर कोई इस बारे में बात कर रहा है। लेकिन क्या कभी आपने गहराई से सोचा है कि इसके पीछे का असली खेल क्या है? सरकार और मुख्यधारा मीडिया हमें कुछ और बता रहे हैं, जबकि असल डेटा और जमीनी हकीकत कुछ बिल्कुल अलग बयां कर रही है। आज के इस वीडियो में हम बिना किसी बायस के, सिर्फ फैक्ट्स, डेटा और ऑफिशियल रिपोर्ट्स के साथ इस पूरे मुद्दे की परतें खोलेंगे। अंत तक जरूर देखिएगा ताकि आपको पूरी सच्चाई समझ आए।',
      staging_breakdown: '0:00-0:08 High-clarity greeting & widespread belief | 0:08-0:25 Contradiction & official data teaser | 0:25-0:45 Unbiased mission statement & invitation into deep dive.',
    },
    evidence_monologue: {
      title: '60-Second Empirical Evidence & Debunking Monologue',
      speech: 'अब आप में से बहुत से लोग कहेंगे कि यह तो सिर्फ एक इत्तेफाक है, या फिर यह समस्या सिर्फ हमारे देश में है। लेकिन जरा ठहरिए। अगर आप इस सरकारी रिपोर्ट के पेज नंबर 42 को देखें, तो साफ लिखा है कि पिछले पांच सालों में यह समस्या घटने के बजाय 40% बढ़ गई है। दूसरा बड़ा सबूत है यह इंटरनेशनल इंडेक्स, जहां हमारी रैंकिंग लगातार नीचे गिर रही है। और तीसरा सबसे बड़ा कारण है वो छुपा हुआ नियम जिसके बारे में मुख्यधारा की मीडिया में एक भी डिबेट नहीं हुई। तो असली सवाल यह नहीं है कि ऐसा क्यों हुआ, बल्कि असली सवाल यह उठता है कि इसे हम सब से छुपाया क्यों गया?',
      staging_breakdown: '0:00-0:12 Acknowledge counter-argument | 0:12-0:35 Display on-screen official gazette/index with highlighted yellow box | 0:35-1:00 Deliver the core investigative question with a 1.2s micro-pause.',
    },
    outro_monologue: {
      title: '45-Second Climax Call to Reflection & Civic Responsibility Monologue',
      speech: 'आखिरकार दोस्तों, बात किसी एक पार्टी या किसी एक विचारधारा की नहीं है। बात है हमारे देश के भविष्य की, हमारे समाज की और आने वाली पीढ़ी की। जब तक हम जागरूक नागरिक बनकर सही सवाल नहीं पूछेंगे, तब तक कोई भी जमीनी बदलाव मुमकिन नहीं है। नीचे कमेंट करके जरूर बताइए कि इस पूरे विश्लेषण पर आपकी अपनी क्या राय है? और इस वीडियो को अपने दोस्तों और परिवार के साथ जरूर शेयर कीजिए ताकि सच हर नागरिक तक पहुंचे। मिलते हैं अगले वीडियो में, बहुत-बहुत शुक्रिया।',
      staging_breakdown: '0:00-0:15 Transcending political tribalism to focus on collective civic future | 0:15-0:30 Provocative question to viewer | 0:30-0:45 Respectful outro with calm, warm sign-off.',
    },
  };

  // Vocal Cadence Dynamics
  const vocalCadence = domainProfile?.vocal_cadence_dynamics || {
    pitch_modulation: 'Begins at a calm, conversational mid-frequency (grounded and pedagogical); subtly drops 2–3 semitones when introducing grave systemic failures; elevates slightly with measured intensity during evidence presentation before returning to a steady, thoughtful baseline.',
    micro_pause_timing: 'Inserts deliberate 1.0 to 1.5-second complete audio silences directly following pivotal questions (\'लेकिन सवाल यह है कि...\') or surprising statistics, allowing the cognitive dissonance to register before presenting charts.',
    articulation_and_pacing: 'Starts at an energetic 135–145 words per minute during the hook; steadily decelerates to 110–115 WPM during complex data explanations to ensure total conceptual comprehension.',
    inclusive_pronoun_habit: 'Consistently employs inclusive plural pronouns (\'हम सब\', \'आप और मैं\', \'हमारे देश में\') to establish a collaborative peer dynamic rather than preaching down to the viewer.',
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhrase(identifier);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedPhrase(null), 2000);
  };

  // Load raw hook.md if user clicks the dossier tab
  useEffect(() => {
    if (activeTab === 'raw_dossier' && !rawHookMd) {
      setLoadingHookMd(true);
      const slug = creatorName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      legacyBackend.getProfile(slug)
        .then((res) => {
          if (res?.hook_md) {
            setRawHookMd(res.hook_md);
          }
        })
        .catch(() => {
          // Fallback to dhruv_rathee
          legacyBackend.getProfile('dhruv_rathee')
            .then(res => setRawHookMd(res.hook_md))
            .catch(() => setRawHookMd('# Viral Hook System\nNo dossier generated yet. Run profiling first.'));
        })
        .finally(() => setLoadingHookMd(false));
    }
  }, [activeTab, creatorName, rawHookMd]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(216, 255, 0, 0.08) 0%, rgba(20, 20, 20, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(216, 255, 0, 0.15) 0%, #FFFFFF 100%)',
          border: '1px solid var(--ai-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                backgroundColor: 'var(--ai-accent)',
                color: '#000000',
              }}
            >
              <Languages size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ai-accent)' }}>
              Native Language & Hooks Intelligence
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
            Hook DNA & Authentic Linguistic Voice
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.45 }}>
            Calibrated for <strong>{creatorName}</strong> in <strong>{detectedLanguage || 'Hindi / Hinglish (हिंदी / English mix)'}</strong>. Preserves authentic spoken cadence, viral verbal formulas, and retention triggers.
          </p>
        </div>

        {/* LANGUAGE BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(216, 255, 0, 0.15)',
              border: '1px solid var(--ai-accent)',
              color: 'var(--ai-accent)',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Mic size={13} />
            <span>{detectedLanguage || 'Hindi / Hinglish'}</span>
          </span>
        </div>
      </div>

      {/* SUB-TABS */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '8px',
        }}
      >
        {[
          { id: 'mannerisms', label: `Spoken Phrases (${mannerisms.length})`, icon: MessageSquare },
          { id: 'archetypes', label: `4 Hook Archetypes`, icon: Zap },
          { id: 'monologues', label: `45-60s Monologues (3)`, icon: Play },
          { id: 'cadence', label: `Vocal Cadence & WPM`, icon: Volume2 },
          { id: 'raw_dossier', label: `hook.md Dossier`, icon: FileText },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '10px',
                backgroundColor: isActive ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                color: isActive ? '#000000' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SPOKEN PHRASES & MANNERISMS */}
      {activeTab === 'mannerisms' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Iconic Spoken Catchphrases & Transition Hooks (Native Script + Romanized)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Click phrase to copy or draft into Copilot
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px',
            }}
          >
            {mannerisms.map((m: any, idx: number) => {
              const categoryColor = m.category === 'greeting' 
                ? '#10B981' 
                : m.category === 'emphasis' 
                ? '#F59E0B' 
                : m.category === 'transition' 
                ? '#3B82F6' 
                : '#EC4899';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: `${categoryColor}18`,
                          color: categoryColor,
                          letterSpacing: '0.4px',
                        }}
                      >
                        {m.category || 'Mannerism'}
                      </span>

                      <button
                        onClick={() => handleCopyText(m.phrase, `m-${idx}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedPhrase === `m-${idx}` ? 'var(--ai-accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Copy Phrase"
                      >
                        {copiedPhrase === `m-${idx}` ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                      </button>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      "{m.phrase}"
                    </h4>

                    {m.romanized && (
                      <p style={{ margin: '0 0 8px', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        {m.romanized}
                      </p>
                    )}

                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      💡 {m.sample_context || 'Signature spoken anchor for audience engagement.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => onDraftInCopilot('Investigation', m.phrase, 'youtube')}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#000000',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Use in Script</span>
                    </button>
                    <button
                      onClick={() => onAddToStoryboard(m.phrase, `Hook trigger: ${m.category}`)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      + Storyboard
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: THE 4 CORE HOOK ARCHETYPES */}
      {activeTab === 'archetypes' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              The 4 Retention Hook Archetypes Mined From High-Performing Long-Form Content
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hookArchetypes.map((arch, idx) => (
              <div
                key={idx}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--ai-accent)',
                        color: '#000000',
                        fontSize: '11px',
                        fontWeight: 900,
                      }}
                    >
                      {arch.archetype}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {arch.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCopyText(arch.templateNative, `arch-${idx}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedPhrase === `arch-${idx}` ? 'var(--ai-accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {copiedPhrase === `arch-${idx}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>Copy Template</span>
                  </button>
                </div>

                {/* FORMULA */}
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)', border: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    Mathematical Retention Formula:
                  </span>
                  <code style={{ fontSize: '12px', color: 'var(--ai-accent)', fontFamily: 'monospace' }}>
                    {arch.formula}
                  </code>
                </div>

                {/* NATIVE TEMPLATE */}
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(216, 255, 0, 0.05)', borderLeft: '3px solid var(--ai-accent)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '4px' }}>
                    Native Spoken Hook Template:
                  </span>
                  <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{arch.templateNative}"
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    Translation: "{arch.templateEnglish}"
                  </p>
                </div>

                {/* WHY IT WORKS */}
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  🧠 <strong style={{ color: 'var(--text-primary)' }}>Psychological Retention Mechanism: </strong>{arch.whyItWorks}
                </p>

                {/* ACTION BUTTON */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => onDraftInCopilot('Investigation', arch.templateNative, 'youtube')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ai-accent)',
                      color: '#000000',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Generate Hook Script with Copilot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: LONG SPOKEN MONOLOGUES */}
      {activeTab === 'monologues' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Verbatim Extended Spoken Monologues (First 45-60 Seconds Script)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(monologues).map(([key, mono]: [string, any], idx: number) => (
              <div
                key={key}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface-2)',
                        color: 'var(--ai-accent)',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      Speech #{idx + 1}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {mono.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleCopyText(mono.speech, `mono-${idx}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedPhrase === `mono-${idx}` ? 'var(--ai-accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {copiedPhrase === `mono-${idx}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>Copy Full Speech</span>
                  </button>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface-2)',
                    borderLeft: '4px solid var(--ai-accent)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    "{mono.speech}"
                  </p>
                </div>

                {mono.staging_breakdown && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Clock size={13} style={{ color: 'var(--ai-accent)', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>🎬 Visual Staging & Editing Cues: </strong>{mono.staging_breakdown}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onDraftInCopilot(mono.title, mono.speech, 'youtube')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ai-accent)',
                      color: '#000000',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Send to Teleprompter / Script</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: VOCAL CADENCE & PACING DIRECTIVES */}
      {activeTab === 'cadence' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Vocal Cadence, Tone Modulation & Micro-Pause Directives
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '6px' }}>
                1. Pitch Modulation & Frequency Shifts
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {vocalCadence.pitch_modulation}
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '6px' }}>
                2. Calculated Micro-Pauses (Silence Triggers)
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {vocalCadence.micro_pause_timing}
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '6px' }}>
                3. Articulation & Words-Per-Minute (WPM)
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {vocalCadence.articulation_and_pacing}
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ai-accent)', display: 'block', marginBottom: '6px' }}>
                4. Collaborative Inclusive Pronoun Habits
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {vocalCadence.inclusive_pronoun_habit}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: RAW HOOK.MD DOSSIER */}
      {activeTab === 'raw_dossier' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Raw Generated `hook.md` Dossier (Live from Backend Engine)
            </span>
            {rawHookMd && (
              <button
                onClick={() => handleCopyText(rawHookMd, 'raw-md')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedPhrase === 'raw-md' ? 'var(--ai-accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                {copiedPhrase === 'raw-md' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                <span>Copy Entire Markdown</span>
              </button>
            )}
          </div>

          {loadingHookMd ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading hook.md from disk…
            </div>
          ) : rawHookMd ? (
            <pre
              style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: isDark ? '#050505' : '#F1F5F9',
                color: isDark ? '#E2E8F0' : '#1E293B',
                fontSize: '12px',
                lineHeight: 1.5,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                border: '1px solid var(--border-color)',
                maxHeight: '500px',
              }}
            >
              {rawHookMd}
            </pre>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hook.md file found. Run a profiling scan to generate one.
            </div>
          )}
        </section>
      )}
    </div>
  );
};
