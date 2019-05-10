/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var passport = require('passport');

module.exports = {
    signup: async (req, res) => {
        const data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            address: req.body.address,
            phone_number: req.body.phone_number,
            isactive:req.body.isactive
        };

        let exist = await User.findOne({
            email: data.email
        });
        if (exist) {
            return res.status(400).json(Res.error(undefined, {
                message: sails.__("emailAlreadyExist")
            }));
        }
        let create = await User.create(data).fetch();
        if (!create) {
            return res.status(400).json(Res.error(undefined, {
                message: sails.__("registerFailed")
            }));
        }
        var digits = '0123456789'; 
        let OTP = ''; 
        for (let i = 0; i < 6; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        Mailer.sendWelcomeMail(create,OTP);
        return res.status(201).json(Res.success(create, {
            message: sails.__("registerSuccess")
        }))

    },
    login: async (req, res) => {


        passport.authenticate('local', function (err, user, info) {
            console.log(err, user, info)
            if (err) {
                return res.status(403).json(Res.error(err, {
                    message: 'Something error.'
                }));
            }

            if (!user) {
                return res.status(401).json(Res.error(undefined, {
                    message: info.message
                }));
            }
            if(!user.isactive){
                return res.status(401).json(Res.error(undefined, {
                    message: 'Email has not been activated'
                }));
            }
            var templateToken = {
                "createdAt": user.createdAt,
                "updatedAt": user.updatedAt,
                "name": user.email,
                "id": user.id,
                "lastName": user.phone,
                "firstName": user.firstName
            }

            var token = jwToken.generate({
                user: templateToken
            });

            jwToken.verify(token, async (err, decode) => {
                if (err) return res.status(401).json(Res.error(err, {
                    message: sails.__('invalidToken')
                }));

                console.log('token', token)
                const adata = {
                    token: token,
                    isactive: true,
                    issuedAt: decode.iat,
                    expiretime: decode.exp,
                    owner: user.id
                }

                let createdToken = await Jwtoken.create(adata).fetch();
                console.log('createdToken', createdToken);
                let data = {
                    user: user,
                    token: token,
                    iat: decode.iat,
                    exp: decode.exp
                }

                return res.status(200).json(Res.success(data, {
                    message: sails.__('loginSuccess')
                }));


            });

        })(req, res);
    },

    logout: async (req, res) => {
        console.log(req.user)
        if (req.user) {
            var checktonken = await Jwtoken.findOne({
                token: req.user.token,
                owner: req.user.id,
                isactive: true
            });
            if (!checktonken) {
                return res.status(400).json(Res.error(undefined,{
                    message:sails.__('didNotLoggedIn')
                }))
            }
            try {
                var updateToken= await Jwtoken.update({
                    id:checktonken.id
                },{
                    isactive:false
                }).fetch();
            } catch (error) {
                return res.status(400).json(Res.error(undefined,{
                    message:loggoutFailed
                }))
            }
            //delete req.user;
            return res.status(200).json(Res.success(null, {
              message: sails.__('hasBeenLoggedOut')
            }));
        }
        else {
            return res.status(400).json(Res.error(undefined, {
                message: sails.__('didNotLoggedIn')
              }));
        }
    },
    active: async(req,res)=>{
        var user= await User.findOne({
            email:req.body.email
        });
        console.log(user)
        if(!user){
            return res.status(400).json(Res.error(undefined,{
                message:'Incorrect username.'
            }))
        }
        var otp=await Otp.findOne({
            owner:user.id,
            otp:req.body.otp
        })
        if(!otp){
            return res.status(400).json(Res.error(undefined,{
                message:"Incorrect otp "
            }));
        }
        else if(new Date().getTime()>otp.otp_expiretime){
            return res.status(400).json(Res.error(undefined,{
                message:"otp expired"
            }));
        }

        try {
            var update= await User.update({
                id:user.id
            },{
                isactive:true
            }).fetch();
        } catch (error) {
            return res.status(400).json(Res.error(undefined,{
                message:"activefailed"
            }));
        }
        return res.status(200).json(Res.success(null, {
            message: "account has been activated"
          }));

    },
    resetotp: async(req,res)=>{
        var user= await User.findOne({
            email:req.body.email
        });
        console.log(user)
        if(!user){
            return res.status(400).json(Res.error(undefined,{
                message:'Incorrect username.'
            }))
        }
        if(user.isactive)
            return res.status(400).json(Res.error(undefined,{
                message:'The account isactive ,cannot be reset OTP.'
            }))
        var digits = '0123456789'; 
        var OTP = ''; 
        for (let i = 0; i < 6; i++ ) { 
            OTP += digits[Math.floor(Math.random() * 10)]; 
        } 
        try {
            var update= await Otp.update({
                owner:user.id
            },{
                otp:OTP,
                otp_expiretime:new Date().getTime()+300000
            }).fetch();
        } catch (error) {
            return res.status(400).json(Res.error(undefined,{
                message:"resetfailed"
            }));
        }
        return res.status(200).json(Res.success(update, {
            message: "OTP has been reset"
          }));

    }
};

