Skip to content
appwrite

Search in docs
Platform
Platform
Overview
Shortcuts
Roles
Integration
Events
Webhooks
Response codes
Error handling
Access control
Permissions
Rate limits
API keys
Dev keys
Plans
Billing
Free
Pro
Scale
Enterprise
Open source
Add ons
Compute
Phone OTP
Image Transformations
Database Reads and Writes
Configuration
Custom domains
Message templates
Policies
Release
Fair use
Abuse
Support SLA
New
Uptime SLA
New
Refund
New
Message templates
Appwrite uses emails to communicate with users to perform authentication and verification actions. Emails can be customized to fit your app's design and voice.

Each Appwrite project can have its own set of unique templates. Templates also support localization, so every template can be written in multiple languages and served depending on the configured locale.

Custom SMTP server
Appwrite Cloud has a default SMTP server to get you started. This SMTP server sends generic emails and doesn't allow customizing SMTP templates. To use custom SMTP templates, you will need to configure your own SMTP server.

There are many third-party SMTP providers like SendGrid and Mailgun. Before proceeding, pick an SMTP provider, create an account, and obtain Sender name, Sender email, Server host, Server port, Username, and Password.

Navigate to your project's Settings.

Navigate to the SMTP tab.

Under SMTP server, toggle Custom SMTP server.

Input Sender name, Sender email, Server host, Server port, Username, and Password from your provider.

Click Update.

Customize templates
You can customize email templates for each of your projects in the Appwrite Console.

Custom SMTP server required
The built-in email service does not support custom email templates to prevent malicious templates. Configure a custom SMTP server to enable custom email templates.

In your project, navigate to the Auth service.

Under the Auth service, navigate to the Templates tab.

Expand the email template you want to edit.

Select the Template language. You can have a different template for each language your app supports.

Update the email template fields and click Update to save your changes.

Email templates
You can customize the email templates for account verification, magic-url authentication, password resets, and user invites.

Email template components
Each email template has the following components that you can customize.

Component	Description
Sender name	Readers will see this as a display name of the sender.
Sender email	Readers will see this as a display email of the sender. This email must be authenticated on the SMTP provider you've configured, otherwise it will be delivered to the spam folder. This usually means the email must end with the same domain as your SMTP username.
Reply to	Readers will reply to this email address instead of the sender address. You can leave this field empty, and the sender email will be used automatically.
Subject	The title of the email.
Message	The body of the email in HTML format. You can find the variables available in the Email Template Syntax section.
Email template syntax
Variables can be used in email templates to dynamically construct unique emails for each reader. These variables can only be used in the Message field of the email template.

Variable	Description
{{project}}	The project name.
{{team}}	The project team's name.
{{user}}	The name of the user receiving the email. This variable is not available in the Magic URL template, as there might not be a user yet.
{{redirect}}	The URL for the user to complete the email template's action.
Email template syntax
Here's an example of using these variables in a template.

HTML

<!doctype html>
<html>

<head>
    <!-- <style>
        ... your style here
    </style> -->
</head>

<body style="direction: ltr">

    <div style="max-width:650px; word-wrap: break-word; overflow-wrap: break-word;
  word-break: break-all; margin:0 auto;">
        <table style="margin-top: 32px">
            <tr>
                <td>
                    <h1>{{subject}}</h1>
                </td>
            </tr>
        </table>

        <table style="margin-top: 40px">
            <tr>
                <td>
                    <p>Hello </p>

                    <p>Follow this link to reset your {{project}} password.</p>

                    <a href="{{redirect}}" target="_blank" rel="noopener noreferrer">{{redirect}}</a>

                    <p><br />If you didn't ask to reset your password, you can ignore this message.</p>
                    <br />

                    <p>Thanks
                        <br />
                        {{project}} team</p>
                </td>
            </tr>
        </table>
    </div>

</body>

</html>
Localization
Each template can have multiple supported locales, displayed in different format and language. This can be configured under the Template language selector of each template.

You can send messages in different languages by setting the locale with client.setLocale() in the SDKs or the X-Appwrite-Locale HTTP header. View here the list of available locales.

For example, you can send an email verification in French.


import { Client, Account } from "appwrite";

const client = new Client();

const account = new Account(client);

client
    .setEndpoint('https://<REGION>.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('<PROJECT_ID>')                 // Your project ID
    .setLocale('fr')                             // Your locale
;

const promise = account.createVerification('https://example.com');

promise.then(function (response) {
    console.log(response); // Success
}, function (error) {
    console.log(error); // Failure
});
Was this page helpful?


 Update on GitHub
On This Page
Custom SMTP server
Customize templates
Email templates
Email template components
Email template syntax
Email template syntax
Localization

Back to Top
Support
Status
Copyright © 2025 Appwrite
Search in docs
Recommended
