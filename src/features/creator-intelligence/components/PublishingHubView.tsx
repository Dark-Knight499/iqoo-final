import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Plus, 
  Video, 
  FileText, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  Copy, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/shared/state/app.store';
import { 
  legacyBackend, 
  PublishJob, 
  PublishCreateRequest 
} from '@/services/legacyBackend';

interface PublishingHubViewProps {
  creatorId: string;
  initialDraft?: {
    platform?: string;
    content_format?: string;
    title?: string;
    content?: string;
    tags?: string[];
  } | null;
}

export const PublishingHubView: React.FC<PublishingHubViewProps> = ({
  creatorId,
  initialDraft,
}) => {
  const { theme, showToast } = useAppStore();
  const isDark = theme !== 'light';

  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Job Creation State
  const [showCompose, setShowCompose] = useState<boolean>(false);
  const [composePlatform, setComposePlatform] = useState<string>('youtube');
  const [composeFormat, setComposeFormat] = useState<string>('short');
  const [composeTitle, setComposeTitle] = useState<string>('');
  const [composeContent, setComposeContent] = useState<string>('');
  const [composeTags, setComposeTags] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Action Loading states
  const [actionLoadingJobId, setActionLoadingJobId] = useState<string | null>(null);

  // Rejection Dialog State
  const [rejectingJobId, setRejectingJobId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Tone mismatch or needs script revision');

  const fetchJobs = () => {
    setIsLoading(true);
    setError(null);
    legacyBackend.getPublishJobs(filterStatus)
      .then((res) => {
        setJobs(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error('Error fetching publish jobs:', err);
        setError(err instanceof Error ? err.message : 'Publish queue unavailable.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, [filterStatus]);

  // Handle incoming draft if passed
  useEffect(() => {
    if (initialDraft) {
      if (initialDraft.platform) setComposePlatform(initialDraft.platform);
      if (initialDraft.content_format) setComposeFormat(initialDraft.content_format);
      if (initialDraft.title) setComposeTitle(initialDraft.title);
      if (initialDraft.content) setComposeContent(initialDraft.content);
      if (initialDraft.tags) setComposeTags(initialDraft.tags.join(', '));
      setShowCompose(true);
    }
  }, [initialDraft]);

  const handleApprove = (jobId: string) => {
    setActionLoadingJobId(jobId);
    legacyBackend.approvePublishJob(jobId, {
      reviewer_name: 'Creator Admin',
      feedback: 'Approved for automated multi-platform dispatch via Composio.',
    })
      .then((res) => {
        showToast(res.message || 'Job approved and dispatched via Composio!');
        fetchJobs();
      })
      .catch((err) => {
        showToast(`Approval failed: ${err.message}`);
      })
      .finally(() => {
        setActionLoadingJobId(null);
      });
  };

  const handleReject = (jobId: string) => {
    if (!rejectionReason.trim()) return;
    setActionLoadingJobId(jobId);
    legacyBackend.rejectPublishJob(jobId, {
      reviewer_name: 'Creator Admin',
      rejection_reason: rejectionReason.trim(),
    })
      .then((res) => {
        showToast('Job rejected and saved to history.');
        setRejectingJobId(null);
        fetchJobs();
      })
      .catch((err) => {
        showToast(`Rejection failed: ${err.message}`);
      })
      .finally(() => {
        setActionLoadingJobId(null);
      });
  };

  const handleCreatePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeContent.trim()) {
      showToast('Please enter post content or script');
      return;
    }

    setIsSubmitting(true);
    const tagsArray = composeTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    legacyBackend.createPublishJob({
      creator_id: creatorId.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'dhruv_rathee',
      platform: composePlatform,
      content_format: composeFormat,
      title: composeTitle.trim() || undefined,
      content: composeContent.trim(),
      tags: tagsArray,
      require_human_approval: true,
    })
      .then((res) => {
        showToast(res.message || 'Publish job created! Awaiting human approval.');
        setShowCompose(false);
        setComposeTitle('');
        setComposeContent('');
        setComposeTags('');
        fetchJobs();
      })
      .catch((err) => {
        showToast(`Submission failed: ${err.message}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const pendingCount = jobs.filter(j => j.status === 'PENDING_APPROVAL').length;

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
              <Send size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--ai-accent)' }}>
              Composio Multi-Platform Publishing Hub
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
            Human Approval & Automated Dispatch Queue
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.45 }}>
            Strict Human-in-the-Loop gate. Authorize, review, or edit AI drafts before triggering Composio's real-time tools for YouTube, X / Twitter, LinkedIn, and Substack.
          </p>
        </div>

        {/* COMPOSE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowCompose(!showCompose)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--ai-accent)',
              color: '#000000',
              border: 'none',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={14} />
            <span>{showCompose ? 'Close Compose' : 'Create New Publish Job'}</span>
          </button>
        </div>
      </div>

      {/* COMPOSE NEW JOB FORM DRAWER */}
      {showCompose && (
        <section
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--ai-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--ai-accent)" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Draft New Multi-Platform Post for Composio
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Requires Human Approval Gate: Enabled
            </span>
          </div>

          <form onSubmit={handleCreatePublishJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Target Platform
                </label>
                <select
                  value={composePlatform}
                  onChange={(e) => setComposePlatform(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="youtube">YouTube (Video / Shorts)</option>
                  <option value="twitter">X / Twitter (Post / Thread)</option>
                  <option value="linkedin">LinkedIn (Post / Article)</option>
                  <option value="substack">Substack (Article / Newsletter)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Content Format
                </label>
                <select
                  value={composeFormat}
                  onChange={(e) => setComposeFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="short">Short / Reel</option>
                  <option value="video">Long-Form Video</option>
                  <option value="post">Social Post</option>
                  <option value="thread">Thread</option>
                  <option value="article">Newsletter Article</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Title (Optional for short posts)
              </label>
              <input
                type="text"
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
                placeholder="e.g. The Real Data Behind the Electoral Bonds Scandal"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Content / Body Script (Full Copy) *
              </label>
              <textarea
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                rows={5}
                placeholder="Enter post copy, hook opening, or full video description..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Hashtags (Comma-separated)
              </label>
              <input
                type="text"
                value={composeTags}
                onChange={(e) => setComposeTags(e.target.value)}
                placeholder="e.g. CivicRights, FactCheck, DeepDive"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-2)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--ai-accent)',
                  color: '#000000',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Submit to Approval Queue</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FILTER TABS & REFRESH BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'ALL', label: `All Jobs (${jobs.length})` },
            { id: 'PENDING_APPROVAL', label: `Pending Review (${pendingCount})` },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'var(--ai-accent)' : 'var(--bg-surface-2)',
                  color: isSelected ? '#000000' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--ai-accent)' : '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchJobs}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            color: 'var(--ai-accent)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {/* JOBS LIST */}
      {isLoading && jobs.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--ai-accent)' }} />
          Loading Composio publishing queue…
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <ShieldCheck size={32} style={{ color: 'var(--ai-accent)', margin: '0 auto 8px', opacity: 0.8 }} />
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800 }}>
            No Publish Jobs in Queue
          </h4>
          <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Draft a new post above or send an actionable suggestion directly from "What To Create Next".
          </p>
          <button
            onClick={() => setShowCompose(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--ai-accent)',
              color: '#000000',
              border: 'none',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Create First Publish Job
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {jobs.map((job) => {
            const isPending = job.status === 'PENDING_APPROVAL';
            const isApproved = job.status === 'APPROVED';
            const isPublished = job.status === 'PUBLISHED';
            const isRejected = job.status === 'REJECTED';

            const statusBg = isPending 
              ? 'rgba(245, 158, 11, 0.15)' 
              : isPublished 
              ? 'rgba(16, 185, 129, 0.15)' 
              : isApproved 
              ? 'rgba(59, 130, 246, 0.15)' 
              : 'rgba(239, 68, 68, 0.15)';

            const statusColor = isPending 
              ? '#F59E0B' 
              : isPublished 
              ? '#10B981' 
              : isApproved 
              ? '#3B82F6' 
              : '#EF4444';

            return (
              <div
                key={job.job_id}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: isPending ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* TOP HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface-2)',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {job.platform} • {job.content_format}
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ID: {job.job_id}
                    </span>
                  </div>

                  {/* STATUS BADGE */}
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: statusBg,
                      color: statusColor,
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {isPending ? <Clock size={12} /> : isPublished ? <CheckCircle2 size={12} /> : isRejected ? <XCircle size={12} /> : <AlertCircle size={12} />}
                    <span>{job.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* TITLE & CONTENT */}
                <div>
                  {job.title && (
                    <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {job.title}
                    </h4>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {job.content}
                  </p>
                </div>

                {/* TAGS */}
                {job.tags && job.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--bg-surface-2)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* COMPOSIO EXECUTION METADATA */}
                {job.composio_action && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface-2)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Composio Tool: <code style={{ color: 'var(--ai-accent)' }}>{job.composio_action}</code></span>
                    {job.composio_execution_status && (
                      <span>Status: <strong style={{ color: 'var(--text-secondary)' }}>{job.composio_execution_status}</strong></span>
                    )}
                  </div>
                )}

                {job.published_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={13} color="var(--ai-accent)" />
                    <a
                      href={job.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: 'var(--ai-accent)', textDecoration: 'none', fontWeight: 700 }}
                    >
                      View Live Published Post →
                    </a>
                  </div>
                )}

                {/* REJECTION REASON IF PRESENT */}
                {job.rejection_reason && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', fontSize: '11px' }}>
                    <strong>Rejection Feedback:</strong> {job.rejection_reason}
                  </div>
                )}

                {/* HUMAN-IN-THE-LOOP APPROVAL CONTROLS */}
                {isPending && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => handleApprove(job.job_id)}
                      disabled={actionLoadingJobId === job.job_id}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {actionLoadingJobId === job.job_id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      <span>Approve & Dispatch via Composio</span>
                    </button>

                    <button
                      onClick={() => setRejectingJobId(job.job_id)}
                      disabled={actionLoadingJobId === job.job_id}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <XCircle size={13} />
                      <span>Reject Draft</span>
                    </button>
                  </div>
                )}

                {/* REJECTION REASON PROMPT */}
                {rejectingJobId === job.job_id && (
                  <div style={{ marginTop: '6px', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Reason for Rejection (saved to guide AI refinement):
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Tone is too aggressive, or missing RTI citation"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '12px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setRejectingJobId(null)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: 'none',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(job.job_id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
