/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    signup:async(req,res)=>{
        const data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            role:req.body.role,
            address:req.body.address,
            phone_number:req.body.phone_number
          };

          let exist=await User.findOne({
              email:data.email
          })
          if(exist)
          {
              return res.status(400).json(Res.error(undefined,{
                  message: sails.__("emailAlreadyExist")
            }))
          }
          let create= await User.create(data).fetch();
          if(!create)
          {
            return res.status(400).json(Res.error(undefined, {
                message: sails.__("registerFailed")
              }));
          }

          return res.status(201).json(Res.success(create,{
            message:sails.__("registerSuccess")
        }))
          
    }

};

