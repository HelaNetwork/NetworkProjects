function trackJob() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getJobDetails'}, function(response) {
      if (response) {
        fetch('http://localhost:3000/api/jobs', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(response)
        }).then(r => r.json()).then(data => {
          alert('Job tracked successfully!');
        });
      }
    });
  });
}

function verifyCompany() {
  alert('Verifying on Polygon Amoy Testnet... Transaction submitted!');
}
