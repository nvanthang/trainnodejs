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
            phone_number: req.body.phone_number
        };

        let exist = await User.findOne({
            email: data.email
        })
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

        Mailer.sendWelcomeMail(create);
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
    }
};

