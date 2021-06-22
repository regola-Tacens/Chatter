const { User, Message  } = require('../../models')
const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken') 
const { JWT_SECRET } = require('../../config/env.json')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const { NoUnusedFragmentsRule } = require('graphql')

module.exports = {
    Query: {
      getUsers: async (parent, args, { user }) => {

        try {
            if (!user) throw new AuthenticationError('Unauthenticated')

              let users = await User.findAll({
                attributes: ['username', 'imageUrl', 'createdAt'],
                where: { username: { [Op.ne] : user.username}}
              })

              const allUserMessages = await Message.findAll({
                where: {
                  [Op.or]: [{ from: user.username }, { to: user.username }],
                },
                order: [['createdAt', 'DESC']]
              })

              users = users.map(otherUser => {
                const latestMessage = allUserMessages.find(
                  m => m.from === otherUser.username || m.to === otherUser.username
                )
                otherUser.latestMessage = latestMessage;
                return otherUser
              })

              

              return users

          } catch (error) {
              console.log(error)
              throw error
          }
 
      },
      login : async (parents, args) => {
          const { username, password } = args
          let errors = {}
          console.log('args', args)

          try {

            if(username.trim ()=== '') errors.username = 'username must not be empty'
            if(password === '') errors.password = 'password must not be empty'

            if(Object.keys(errors).length > 0) {
                throw new UserInputError('bad input', {errors})
            }
            

            const user = await User.findOne({
                where: { username }
            })
           
            if (!user) {
                errors.username = 'user not found'
                throw new UserInputError('user not found', {errors})
            }

             const correctPassword = await bcrypt.compare(password, user.password)

             if (!correctPassword) {
                errors.password = 'password is incorrect'
                throw new UserInputError('password is incorrect', { errors })
              }
            const token = jwt.sign({
                username
            }, JWT_SECRET, { expiresIn: '1h'})

            // user.token = token

            // return user

            return {
                ...user.toJSON(),
                createdAt: user.createdAt.toISOString(), token
            }

          } catch (err) {
            console.log(err)
            throw err
          }
      }
    },
    Mutation: {
        register: async (parent, args)=> {
            let { username, email, password, confirmPassword } = args
            let errors = {}

            try {
                // validate input data
                if (email.trim()==='') errors.email = 'email must not be empty'
                if (username.trim()==='') errors.username = 'username must not be empty'
                if (password.trim()==='') errors.password = 'password must not be empty'
                if (confirmPassword.trim()==='') errors.confirmPassword = 'repeat password must not be empty'
                
                if( password !== confirmPassword) errors.confirmPassword = 'password must match'

                //check if username / email exists
                const userByUsername = await User.findOne({ where: { username }})
                const userByUserEmail = await User.findOne({ where: { email }})

                if(userByUsername) errors.username = 'Username is taken'
                if(userByUserEmail) errors.email = 'Email is taken'

                // hash password
                password = await bcrypt.hash(password, 6)

                if( Object.keys(errors).length > 0) {
                    throw errors
                }
                // create user
                const user = await User.create({
                    username,
                    email,
                    password
                })
                return user
              } catch (err) {
                console.log(err)
                if( err.name === 'SequelizeValidationError') {
                    err.errors.forEach( e=> errors[e.path] = e.message)
                }
                throw new UserInputError('Bad input', { errors: err })
            }
        },
    }
  };