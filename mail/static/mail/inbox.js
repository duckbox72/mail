document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function view_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Clear out view-email fields
  document.querySelector('#email-sender').innerHTML = '';
  document.querySelector('#email-recipients').innerHTML = '';
  document.querySelector('#email-subject').innerHTML = '';
  document.querySelector('#email-timestamp').innerHTML = '';
  document.querySelector('#email-body').innerHTML = '';

  // Fetch for email data and render email-view
  fetch(`emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    //console.log(email);
    document.querySelector('#email-sender').innerHTML += email.sender;
    email.recipients.forEach(recipient => {
      document.querySelector('#email-recipients').append(`${recipient}, `)
    });
    document.querySelector('#email-subject').innerHTML += email.subject;
    document.querySelector('#email-timestamp').innerHTML += email.timestamp;
    document.querySelector('#email-body').innerHTML += email.body;

    // Clear out #buttons div
    document.querySelector('#buttons').innerHTML = ''

    // Create REPLY_button  
    const reply_button = document.createElement('button');
    reply_button.className = `btn btn-sm btn-outline-primary shadow-sm pl-3 pr-3 mr-2`;
    reply_button.innerHTML = `Reply`;
    // Add event handler to reply_button to toggle compose_view and populate fields accordingly
    reply_button.addEventListener('click', function() {
      //console.log('YOU HAVE CLICKED REPLY BUTTON')
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      
      if (email.subject.startsWith('Re:')) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      } else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      
      document.querySelector('#compose-body').value = `\n \n \n \n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`
    });

    // Create Forward_button  
    const forward_button = document.createElement('button');
    forward_button.className = `btn btn-sm btn-outline-primary shadow-sm pl-2 pr-2 mr-2`;
    forward_button.innerHTML = `Forward`;
    // Add event handler to reply_button to toggle compose_view and populate fields accordingly
    forward_button.addEventListener('click', function() {
      //console.log('YOU HAVE CLICKED FORWARD BUTTON')
      compose_email();
      
      if (email.subject.startsWith('Fwd:')) {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      } else {
        document.querySelector('#compose-subject').value = `Fwd: ${email.subject}`;
      }
      
      document.querySelector('#compose-body').value = `\n \n \n \n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`
    });

    // Create archive_button TOGGLE archive/unarchive 
    const archive_button = document.createElement('button');
    // Find whether email is archived or unarchived 
    if (email.archived == false) {
      archive_button.innerHTML = 'Archive';
      padding = 'pl-2 pr-2';
    } else {
      archive_button.innerHTML = 'Unarchive';
      padding = 'pl-1 pr-1';
    }
    archive_button.className = `btn btn-sm btn-outline-danger shadow-sm ${padding}`;
    //Add event handler to archive_button (archive/unarchive)
    archive_button.addEventListener('click', function() {  
      //console.log('YOU HAVE CLICKED ARCHIVED BUTTON')  
      // Toggle archived status (true/false)
      if (email.archived == false) {
        fetch(`emails/${email.id}` , {
          method: "PUT",
          body: JSON.stringify( {
            archived: true
          })
        })
      } else {
        fetch(`emails/${email.id}` , {
          method: "PUT",
          body: JSON.stringify({
            archived: false
          })
        })
      };

      // Check email.archived NEW STATUS (after PUT request) to call correct load_mailbox
      fetch(`emails/${email.id}`)
      .then(response => response.json())
      .then(email => {
        if (email.archived == true) {
          load_mailbox('inbox');
        } else {
          load_mailbox('archive');
        }
      });
    
    });
    document.querySelector('#buttons').append(reply_button, forward_button, archive_button);

  })

}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}
                                                    <span class="badge badge-light border shadow-sm" id="badge"></span></h3>`;

  // Fetch mailbox for emails
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //console.log(emails)
    // Display number of emails in mailboxes
    document.querySelector("#badge").innerHTML = emails.length;
    // Display custom message if mailbox is empty 
    if (emails.length == 0) {
      document.querySelector("#emails-view").innerHTML += 
      `<div class="row mt-1 mb-1 pt-2 pb-2 border rounded shadow-sm text-center text-dark small bg-light">
            <div class="col">
                This mailbox is empty.
            </div>
      </div>`;
    };
   
    // If there are mails iteract through each email in emails 
    emails.forEach(email => {
      // Select each email div background color 
      if (email.read == false){
        bg = 'white'
      } else {
        bg = 'light'
      }

      // Create div, set its innerHTML (insert element to div and add a handler)
      const element = document.createElement('div');
      element.className = `row mt-1 mb-1 pt-2 pb-2 border rounded shadow-sm small bg-${bg}`
      element.innerHTML = 
        `<div class="col-md-3 text-dark">
          <b>${email.sender}</b>
        </div>
        <div class="col-md text-dark"">
          ${email.subject}
        </div>
        <div class="col-md-3 text-right text-dark">
          ${email.timestamp}
        </div>`;
      
      // Add event listener (handler) TO CALL email-view when clicked
      element.addEventListener('click', function() {
          // Fetch email with a PUT request to mark as read
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          });
          view_email(email);
      });
      document.querySelector('#emails-view').append(element);
    });
  })
}