const CareerSetup = (() => {
  const render = (container, onSave) => {
    container.innerHTML = `
      <div class="career-setup-modal">
        <h3 style="margin-bottom: 10px; color: #1e40af; font-size: 13px;">💼 One-Time Career Profile Setup</h3>
        
        <div class="settings-row"><label class="settings-label">Skills (comma separated)</label></div>
        <input type="text" id="cs-skills" class="settings-input" placeholder="React, Node.js, Python" />
        
        <div class="settings-row"><label class="settings-label">Looking for</label></div>
        <div style="margin-bottom: 8px; font-size: 11px; display: flex; gap: 8px; flex-wrap: wrap;">
          <label><input type="checkbox" name="cs-looking" value="Internship" checked> Internship</label>
          <label><input type="checkbox" name="cs-looking" value="Full-time"> Full-time</label>
          <label><input type="checkbox" name="cs-looking" value="Freelance"> Freelance</label>
        </div>
        
        <div class="settings-row"><label class="settings-label">Preferred Location</label></div>
        <input type="text" id="cs-location" class="settings-input" placeholder="Pune, Remote" />
        
        <div class="settings-row">
          <label class="settings-label">Remote OK?</label>
          <input type="checkbox" id="cs-remote" checked />
        </div>
        
        <div class="settings-row" style="margin-top: 8px;"><label class="settings-label">Minimum Stipend/Salary (₹/mo)</label></div>
        <input type="number" id="cs-salary" class="settings-input" placeholder="10000" />
        
        <div class="settings-row"><label class="settings-label">Experience Level</label></div>
        <div style="margin-bottom: 8px; font-size: 11px; display: flex; gap: 8px;">
          <label><input type="radio" name="cs-exp" value="Fresher" checked> Fresher</label>
          <label><input type="radio" name="cs-exp" value="1-2 years"> 1-2 yrs</label>
          <label><input type="radio" name="cs-exp" value="3+ years"> 3+ yrs</label>
        </div>
        
        <button id="cs-save-btn" class="settings-save-btn" style="width: 100%; margin-top: 10px;">Save Profile</button>
      </div>
    `;

    document.getElementById('cs-save-btn').addEventListener('click', async () => {
      const skills = document.getElementById('cs-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const lookingFor = Array.from(document.querySelectorAll('input[name="cs-looking"]:checked')).map(el => el.value);
      const location = document.getElementById('cs-location').value.trim();
      const remote = document.getElementById('cs-remote').checked;
      const minSalary = parseInt(document.getElementById('cs-salary').value, 10) || 0;
      const experience = document.querySelector('input[name="cs-exp"]:checked').value;

      const profile = { skills, lookingFor, location, remote, minSalary, experience };
      
      await chrome.storage.sync.set({ careerProfile: profile });
      onSave();
    });
  };

  return { render };
})();
