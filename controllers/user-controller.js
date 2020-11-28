let User = require('../models/user').User
const {body, validationResult} = require('express-validator')
const passport = require('passport')

exports.userController = {
    create: async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/users/register')
        } else {
            try {
                let userParams = getUserParams(req.body)
                let newUser = new User(userParams)
                let user = await User.register(newUser, req.body.password)
                req.flash('success', `${user.fullName}'s account created successfully`)
                res.redirect('/')
            } catch (error) {
                console.log(`Error saving user: ${error.message}`)
                req.flash('error', `Failed to create user account. Invalid email.`)
                res.redirect('back')
            }
        }
    },
    authenticate: async (req, res, next) => {
        await passport.authenticate('local', function (err, user, info) {
            if (err)
                return next(err)
            if (!user) {
                req.flash('error', 'Failed to login')
                return res.redirect('back')
            }
            req.logIn(user, function (err) {
                if (err)
                    return next(err)
                req.flash('success', `${user.fullName} logged in!`)
                return res.redirect('/')
            })
        })(req, res, next);
    },

    view: async (req, res, next) => {
        try {
            const user = await User.findOne({_id: req.query.id.trim()})
            res.render('sales/view_user', {
                title: "Profile",
                objectId: req.query.id,
                first: user.name.first,
                last: user.name.last,
                email: user.email,
                password: user.password
            })

        }catch (error) {
            console.log(`Error saving user: ${error.message}`)
            res.redirect('back')
        }
    }
}

const getUserParams = body => {
    return {
        name: {
            first: body.first,
            last: body.last
        },
        email: body.email,
        password: body.password
    }
}

exports.registerValidations = [
    body('first')
        .notEmpty().withMessage('First name is required')
        .isLength({min: 2}).withMessage('First name must be at least 2 characters'),
    body('last')
        .notEmpty().withMessage('Last name is required')
        .isLength({min: 2}).withMessage('Last name must be at least 2 characters'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({min: 6}).withMessage('Password must be at least 6 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Email is invalid')
]