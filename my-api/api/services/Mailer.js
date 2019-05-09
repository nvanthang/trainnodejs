module.exports.sendWelcomeMail = function (obj) {
    console.log(obj)
    sails.hooks.email.send(
        "welcomeEmail",
        {
            recipientName: "Joe",
            senderName: "Sue"
        },
        {
            to: obj.email,
            subject: "Welcome Email"
        },
        function (err) { console.log(err || "Mail Sent!"); }
    )
}