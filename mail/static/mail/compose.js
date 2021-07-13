// Event Listener when compose-form is submitted 
document.addEventListener('DOMContentLoaded', function() {

    const form = document.querySelector("#compose-form");
    const msg = document.querySelector("#msg");

    form.addEventListener('submit', (event) => {
        //let sender = document.querySelector("#compose-sender")
        let recipients = document.querySelector("#compose-recipients");
        let subject = document.querySelector("#compose-subject");
        let body = document.querySelector("#compose-body")
        //console.log(`Recipients: ${recipients.value}`);
        //console.log(`Subject: ${subject.value}`);
        //console.log(`Body: ${body.value}`);
        //if (sender.length == 0 && recipients.length == 0) return;
        
        // POST request "Send" composed mail
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body.value,
            })
        })
        
        .then(response => response.json())

        .then(result => { 
            if (result.error) {
                alert(result.error);s     
            } 
            if (result.message) {
                alert(result.message);
            }      
        })
        return false;  
    })

});