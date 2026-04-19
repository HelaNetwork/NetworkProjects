const JobsFeed = (() => {
  let userProfile = null;
  let allJobs = [];
  let showSaved = false;

  async function init(container) {
    userProfile = await JobsService.getCareerProfile();
    if (!userProfile) {
      CareerSetup.render(container, () => init(container));
      return;
    }
    renderUI(container);
    await loadJobs();
  }

  function renderUI(container) {
    container.innerHTML = `
      <div class="jobs-header" style="padding: 9px 14px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; gap: 8px; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 11px; font-weight: 600; color: #1e293b;">
            <button id="jf-feed-btn" style="background: none; border: none; font-weight: 700; color: #2563eb; cursor: pointer;">Feed</button> | 
            <button id="jf-saved-btn" style="background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer;">Saved</button>
          </div>
          <div>
            <button id="jf-edit-btn" style="background: none; border: none; font-size: 11px; cursor: pointer; color: #64748b;">⚙️ Edit Profile</button>
            <button id="jf-refresh-btn" style="background: none; border: none; font-size: 11px; cursor: pointer; color: #64748b; margin-left: 5px;">🔄 Refresh</button>
          </div>
        </div>
        <div style="display: flex; gap: 5px;">
          <input type="text" id="jf-search" class="settings-input" style="margin-bottom: 0; flex: 1;" placeholder="Search jobs...">
        </div>
      </div>
      <div id="jf-list" class="list" style="max-height: 250px;">
        <div class="empty">Loading jobs...</div>
      </div>
    `;

    document.getElementById('jf-feed-btn').addEventListener('click', (e) => {
      showSaved = false;
      e.target.style.color = '#2563eb';
      e.target.style.fontWeight = '700';
      const savedBtn = document.getElementById('jf-saved-btn');
      savedBtn.style.color = '#64748b';
      savedBtn.style.fontWeight = '600';
      renderJobs();
    });

    document.getElementById('jf-saved-btn').addEventListener('click', (e) => {
      showSaved = true;
      e.target.style.color = '#2563eb';
      e.target.style.fontWeight = '700';
      const feedBtn = document.getElementById('jf-feed-btn');
      feedBtn.style.color = '#64748b';
      feedBtn.style.fontWeight = '600';
      renderJobs();
    });

    document.getElementById('jf-refresh-btn').addEventListener('click', async () => {
      document.getElementById('jf-list').innerHTML = '<div class="empty">Fetching new jobs...</div>';
      await loadJobs(true);
    });

    document.getElementById('jf-edit-btn').addEventListener('click', () => {
      CareerSetup.render(container, () => init(container));
    });

    document.getElementById('jf-search').addEventListener('input', () => {
      renderJobs();
    });
  }

  async function loadJobs(force = false) {
    try {
      allJobs = await JobsService.bgFetchJobs(force);
      renderJobs();
    } catch (e) {
      document.getElementById('jf-list').innerHTML = `
        <div class="empty" style="color: #dc2626;">Couldn't load jobs right now.<br>Try refreshing.</div>
      `;
    }
  }

  async function renderJobs() {
    const listEl = document.getElementById('jf-list');
    if (!listEl) return;

    const searchTerm = document.getElementById('jf-search')?.value.toLowerCase() || "";
    let savedJobs = await JobsService.getSavedJobs();
    let skippedJobs = await JobsService.getSkippedJobs();

    let displayJobs = [];
    if (showSaved) {
      displayJobs = savedJobs;
    } else {
      displayJobs = allJobs.filter(j => !skippedJobs.includes(j.id) && !savedJobs.find(sj => sj.id === j.id));
      // Background already calculated matchResult and sorted the jobs.
    }

    // Filter by search
    if (searchTerm) {
      displayJobs = displayJobs.filter(j => 
        (j.title || '').toLowerCase().includes(searchTerm) || 
        (j.company || '').toLowerCase().includes(searchTerm) ||
        (j.location || '').toLowerCase().includes(searchTerm)
      );
    }

    if (displayJobs.length === 0) {
      listEl.innerHTML = `<div class="empty">No ${showSaved ? 'saved' : ''} jobs found.</div>`;
      return;
    }

    listEl.innerHTML = '';
    displayJobs.forEach(job => {
      const score = job.matchResult?.score || 0;
      const isSaved = showSaved || savedJobs.find(sj => sj.id === job.id);
      
      const card = document.createElement('div');
      card.className = 'item';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '4px';
      
      const scoreColor = score >= 80 ? '#22c55e' : (score >= 50 ? '#eab308' : '#ef4444');
      
      const reasonsHtml = job.matchResult?.reasons?.length > 0 
        ? `<div class="match-reasons" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
             ${job.matchResult.reasons.map(r => `<span class="reason-tag" style="font-size: 9px; padding: 2px 6px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px;">✅ ${r}</span>`).join('')}
           </div>`
        : '';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div class="item-title" style="margin: 0; white-space: normal;">${job.title}</div>
          <div style="font-size: 10px; font-weight: 700; color: ${scoreColor}; background: ${scoreColor}22; padding: 2px 5px; border-radius: 4px;">
            ${score}% Match
          </div>
        </div>
        <div class="item-meta">
          <span>🏢 ${job.company}</span> • 
          <span>📍 ${job.location} ${job.isRemote ? '(Remote)' : ''}</span>
        </div>
        <div class="item-meta">
          <span class="chip" style="background: #3b82f6;">${job.type || 'Job'}</span>
          ${job.salary ? `<span class="chip" style="background: #10b981;">${job.salary}</span>` : ''}
        </div>
        ${job.skills && job.skills.length > 0 ? `
          <div style="font-size: 9px; color: #64748b; margin-top: 2px; line-height: 1.4;">
            ${job.skills.slice(0, 5).map(s => {
              const matched = userProfile?.skills?.some(us => s.toLowerCase().includes(us.toLowerCase()));
              return `<span style="color: ${matched ? '#15803d' : '#94a3b8'}; font-weight: ${matched ? '700' : '400'};">${s}</span>`;
            }).join(', ')}
          </div>
        ` : ''}
        ${reasonsHtml}
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button class="action-btn apply-btn" data-url="${job.applyLink || '#'}" style="flex: 1; padding: 5px; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 600;">🔗 Apply</button>
          ${isSaved 
            ? `<button class="action-btn remove-btn" data-id="${job.id}" style="flex: 1; padding: 5px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 600;">✖ Remove</button>`
            : `<button class="action-btn save-btn" data-id="${job.id}" style="flex: 1; padding: 5px; background: #e0e7ff; color: #4f46e5; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 600;">🔖 Save</button>
               <button class="action-btn skip-btn" data-id="${job.id}" style="flex: 1; padding: 5px; background: #f1f5f9; color: #64748b; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; font-weight: 600;">✖ Skip</button>`
          }
        </div>
      `;
      listEl.appendChild(card);
    });

    // Event listeners
    listEl.querySelectorAll('.apply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        if (url && url !== '#') chrome.tabs.create({ url });
      });
    });

    listEl.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const job = allJobs.find(j => j.id === id);
        if (job) {
          await JobsService.saveJob(job);
          renderJobs();
        }
      });
    });

    listEl.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await JobsService.removeSavedJob(id);
        renderJobs();
      });
    });

    listEl.querySelectorAll('.skip-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await JobsService.skipJob(id);
        renderJobs();
      });
    });
  }

  return { init };
})();
