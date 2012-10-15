# pinger.jit.su

A thing for making sure stuff is up.

Watches a few sites with timed pings, listening for errors or
unresponsiveness. Sends emails when those happen.

### Deployment to Nodejitsu

Since this is just a simple node app, it easily deploys to nodejitsu.
For now, there are no database dependencies, so the only required
account is SendGrid (or any other service that works with
[node-mailer](https://github.com/andris9/Nodemailer)).

Move `config.prod.example` to `config.prod.js` and update your
credentials for nodemailer and the urls you'd like to monitor. Then run

    jitsu deploy

Follow along with the prompts and in a few minutes you'll have your own
deploy!

### TODOs

* Twilio / SMS integration
* Database backed history / analytics / user admin
* Better emails for extended downtime
* Related Service monitoring (Heroku, etc)

