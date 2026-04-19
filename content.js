chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getJobDetails') {
    const company = document.querySelector('.company-name')?.innerText || 'Unknown Company';
    const role = document.querySelector('.job-title')?.innerText || 'Unknown Role';
    sendResponse({
      company: company,
      role: role,
      status: 'Applied',
      appliedDate: new Date().toISOString(),
      verified: false
    });
  }
});
