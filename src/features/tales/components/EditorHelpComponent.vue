<template>
<article class="studio-help-guide">
  <header class="studio-help-guide__header">
    <h1>Editor Documentation & Writer's Guide</h1>
    <p>Everything you need to write, manage, fact-check, and publish stories on OutScribed.</p>
  </header>

  <!-- SECTION 0: TALES DASHBOARD & NAVIGATION -->
  <section class="help-section">
    <h2>0. Tales Dashboard: Workspace Overview</h2>
    <p>The main Studio dashboard allows you to manage existing stories, refine your workspace via search filters, or launch new drafts.</p>

    <div class="help-grid">
      <div class="help-card">
        <h3>Tales (Draft List)</h3>
        <p>Access your complete collection of stories across all lifecycle states. Click any draft item to load it directly into the Studio canvas.</p>
      </div>

      <div class="help-card">
        <h3>Filter & Search</h3>
        <p>Locate specific stories quickly using multi-faceted query controls:</p>
        <ul>
          <li><strong>Keyword:</strong> Search titles, synopses, or story details.</li>
          <li><strong>Status:</strong> Filter by <code>Created</code> (Draft), <code>Published</code>, <code>Hidden</code> (by Admin or Community flags), or <code>Archived</code>.</li>
          <li><strong>Taxonomy:</strong> Refine by assigned <strong>Category</strong> or target <strong>Country</strong>.</li>
          <li><strong>Sorting Rules:</strong> Order stories by <em>Most Recent</em>, <em>Oldest</em>, <em>Most Commented</em>, <em>Most Saved</em>, <em>Most Flagged</em>, <em>Most Shared</em>, or <em>Most Voted</em>.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Create New Draft</h3>
        <p>Starts a fresh story pipeline. Requires selecting an initial <strong>Category</strong> and entering a working <strong>Title</strong> to initialize the draft state in the system.</p>
      </div>
    </div>
  </section>

  <!-- SECTION 1: ANATOMY OF A TALE -->
  <section class="help-section">
    <h2>1. Anatomy of a Tale</h2>
    <p>Every story on OutScribed is built from distinct structural layers designed to blend creative narrative with factual anchor points.</p>

    <dl class="help-def-list">
      <dt>Basic Information</dt>
      <dd>
        <strong>Title, Country, Category, and Synopsis.</strong>
        <br />Sets the structural framing and metadata for your story. The synopsis serves as the initial hook on discovery feeds.
      </dd>

      <dt>Reality Check (Core USP)</dt>
      <dd>
        <strong>Claim Title, Summary, Source Name (optional), and Source URL (optional).</strong>
        <br />The foundational anchor of OutScribed stories. It highlights the real-world event, news report, or policy that inspired the tale, helping readers separate factual truth from allegorical fiction.
      </dd>

      <dt>Cover Photo (Optional)</dt>
      <dd>
        <strong>Visual Header Graphic.</strong>
        <br />Provides a visual anchor on feed timelines and article headers to boost audience engagement and social sharing.
      </dd>

      <dt>Story Details</dt>
      <dd>
        <strong>Main Prose / Body Content.</strong>
        <br />The primary narrative body authored via the rich text editor. Must be between 512 and 65,535 characters.
      </dd>

      <dt>Tags</dt>
      <dd>
        <strong>Topic Keywords (Up to 10).</strong>
        <br />Categorizes core themes (e.g., <code>#policy</code>, <code>#corruption</code>) to optimize feed discoverability and search indexing.
      </dd>
    </dl>
  </section>

  <!-- SECTION 2: STORY MANAGEMENT & POST-PUBLICATION -->
  <section class="help-section">
    <h2>2. Story Management & Operations</h2>
    
    <div class="help-table-wrapper">
      <dl class="help-def-list">
      <dt>Publish</dt>
      <dd>
        <strong>Description/Usage</strong>
        <br /><i>Applies to Drafts</i>: Validates all required sections and releases your story to public reader timelines.
      </dd>

      <dt>Delete</dt>
      <dd>
        <strong>Description/Usage</strong>
        <br /><i>Applies to drafts</i>: Permanently removes an un-published draft from your account. Deleted drafts cannot be recovered.
      </dd>

      <dt>Archive / Unarchive</dt>
      <dd>
        <strong>Description/Usage</strong>
        <br /><i>Applies to Live stories</i>: Hides a published story from public timelines without losing engagement data or metrics. Can be unarchived at any time.
      </dd>

      <dt>Engagement Metrics</dt>
      <dd>
        <strong>Description/Usage</strong>
        <br /> <i>Applies to Live stories</i>: Provides a daily record of community interaction, tracking votes, saves, comments, flags, and shares.
      </dd>

      <dt>Addendum</dt>
      <dd>
        <strong>Description/Usage</strong>
        <br /><i>Applies to unengaged Live stories</i>: Enables authors to add post-publication corrections, notes, or updates without breaking story history or editing locked prose.
      </dd>
    </dl>
    
    </div>
  </section>

  <!-- SECTION 3: RICH TEXT EDITOR TOOLBAR -->
  <section class="help-section">
    <h2>3. Rich Text Editor Toolbar</h2>
    <p>The Quill toolbar provides formatting tools tailored for clean, long-form journalistic reading.</p>

    <div class="help-grid help-grid--two-col">
      <div class="help-card">
        <h3>Formatting Controls</h3>
        <ul>
          <li><strong>Heading 1 (H1):</strong> Major section divisions within your narrative.</li>
          <li><strong>Heading 2 (H2):</strong> Sub-sections or chapter breakdowns.</li>
          <li><strong>Bold:</strong> Emphasizes key phrases or dialogue beats.</li>
          <li><strong>Italic:</strong> Used for internal monologue, foreign words, or emphasis.</li>
          <li><strong>Underline:</strong> Underlines text for explicit visual accentuation.</li>
          <li><strong>Strikethrough:</strong> Crosses out text—useful for comedic effect or structural corrections.</li>
        </ul>
      </div>

      <div class="help-card">
        <h3>Structure & Links</h3>
        <ul>
          <li><strong>Ordered List (1, 2, 3):</strong> Sequenced items, chronological events, or steps.</li>
          <li><strong>Unordered List (Bullets):</strong> Unranked topic items or takeaways.</li>
          <li><strong>Blockquote:</strong> Indents and styles quoted statements, external testimonies, or excerpts.</li>
          <li><strong>Hyperlink:</strong> Embeds clickable external web references.</li>
          <li><strong>Clear Formatting:</strong> Strips applied styles from selected text, reverting it to plain prose.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- SECTION 4: LIFECYCLE OF A TALE -->
  <section class="help-section">
    <h2>4. Lifecycle of a Tale</h2>
    <p>Every tale progresses through clearly defined operational phases within OutScribed:</p>

    <ol class="help-lifecycle">
      <li>
        <strong>1. Draft Creation:</strong>
        The story is created with basic taxonomy (Category, Country, Title). It remains private in your Studio.
      </li>
      <li>
        <strong>2. Composition & Fact-Checking:</strong>
        You compose the narrative details, attach a Reality Check factual anchor, add tags, and upload a cover photo.
      </li>
      <li>
        <strong>3. Publication:</strong>
        The story passes pre-flight character and validation checks, shifting to <code>Published</code> status on live feeds.
      </li>
      <li>
        <strong>4. Community Engagement:</strong>
        Readers interact via qualitative reactions, comments, votes, shares, and saves. Engagement analytics are recorded daily.
      </li>
      <li>
        <strong>5. Post-Publication Maintenance:</strong>
        If new facts emerge or updates are needed, you append serialized <code>Addendum</code> entries or choose to <code>Archive</code> the story.
      </li>
      <li>
        <strong>6. Moderation Review (Conditional):</strong>
        If flagged heavily by the community, a story may enter a <code>Hidden</code> state pending moderation evaluation.
      </li>
    </ol>
  </section>
</article>
</template>

<style scoped lang="less">
@import "@/assets/css/variables.less";


.studio-help-guide {
  font-family: @font-body;
  line-height: @line-height-ui;
  padding: 0.5rem;
  width: @mid-width;
  max-width: calc(100% - 20px);
  margin: 0 auto;

  &__header {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1.25rem;
    margin-bottom: 2rem;

    h1 {
      font-size: clamp(1.3rem, 5vw, 2.2rem);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    p {
      color: var(--muted-text-color);
    }
  }
}

.help-section {
  margin-bottom: 2.5rem;

  h2 {
    font-size: clamp(1.1rem, 5vw, 1.5em);
    margin: 0 0 0.75rem 0;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  p {
    margin: 0 0 1rem 0;

    code {
      font-family: @font-mono;
      background-color: var(--background-color);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      color: var(--muted-text-color);
    }
  }
}

/* CARDS & GRID LAYOUT */
.help-grid {
  display: flex;
 flex-direction: column;
  gap: 1rem;

}

.help-card {
  background-color: var(--light-background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem;

  h3 {
   font-size: clamp(1.05rem, 5vw, 1.3em);
    margin: 0 0 0.5rem 0;
  }

  p {
    margin-bottom: 0.5rem;
  }

  ul {
    margin: 0;
    padding-left: 1.2rem;
    list-style:circle;

    li {
      margin-bottom: 0.35rem;
      line-height: 1.5;
    }
  }
}

/* DEFINITION LIST (ANATOMY) */
.help-def-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;

  dt {
    font-weight: 600;
    color: var(--muted-text-color);

    &::after {
      content: "";
      display: block;
      width: 24px;
      height: 3px;
      background-color: var(--border-color);
      margin-top: 0.2rem;
    }
  }

  dd {
    margin: 0;
    line-height: 1.6;
    background-color: var(--background-color);
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--border-color);
    border-radius: 0 6px 6px 0;
  }
}

/* LIFECYCLE ORDERED STEPS */
.help-lifecycle {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    position: relative;
    padding: 0.85rem 1rem 0.85rem 1.25rem;
    background-color: var(--background-color);
    border: 1px solid var(--border-color);
    border-left-width: 4px; // Navy step bar
    border-radius: 6px;
    line-height: 1.5;

    strong {
      display: block;
      font-weight:600;
      margin-bottom: 0.25rem;
    }
  }
}
</style>