
var nodemailer = require('nodemailer');
module.exports.sendWelcomeMail = function(obj,otp) {
sails.hooks.email.send(
    "sendMailSignup",
    {
      recipientName: obj.lastname+" "+obj.firstname,
      otp:otp,
    },
    {
      to: obj.email,
      subject: "Confirm OTP"
    },
    async function(err) {
      if(!err)
      {
        let data={
          otp:otp,
          owner:obj.id,
          otp_expiretime:new Date().getTime()+300000
        };
        await Otp.create(data).fetch();
      }
      console.log(err || "It worked!");
    }
  )
// var transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//       user: 'nvthang@tma.com.vn', // generated ethereal user
//       pass: 'anhthangdaica1' // generated ethereal password
//     }
//   });

//   // send mail with defined transport object
//   transporter.sendMail({
//     from: 'nvthang@tma.com.vn', // sender address
//     to: "nguyenvanthang15011996@gmail.com", // list of receivers
//     subject: "Hello", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>" // html body
//   });
 }