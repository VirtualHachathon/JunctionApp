const { withFilter } = require('graphql-subscriptions')
const { RedisPubSub } = require('graphql-redis-subscriptions')
const {
    GraphQLString,
    GraphQLObjectType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInputObjectType,
} = require('graphql')
const { GraphQLDate } = require('graphql-iso-date')
const RegistrationController = require('../registration/controller')
const Event = require('../event/model')
const Redis = require('ioredis')
//const client = new Redis("rediss://default:JSVhlHFiXTnFo1Z1IVok05TOQqccA2qB@redis-11912.c226.eu-west-1-3.ec2.cloud.redislabs.com:11912");
//console.log(client,"##")

const pubsub = new RedisPubSub({
    publisher: new Redis(process.env.REDISCLOUD_URL),
    subscriber: new Redis(process.env.REDISCLOUD_URL),
})

const AlertInput = new GraphQLInputObjectType({
    name: 'AlertInput',
    fields: {
        eventId: {
            type: GraphQLNonNull(GraphQLString),
        },
        content: {
            type: GraphQLNonNull(GraphQLString),
        },
    },
})

const AlertType = new GraphQLObjectType({
    name: 'Alert',
    fields: {
        id: {
            type: GraphQLID,
        },
        eventId: {
            type: GraphQLString,
        },
        content: {
            type: GraphQLString,
        },
        sender: {
            type: GraphQLString,
        },
        sentAt: {
            type: GraphQLDate,
        },
    },
})

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        alerts: {
            type: GraphQLList(AlertType),
            args: {
                eventId: {
                    type: GraphQLNonNull(GraphQLString),
                },
            },
        },
    },
})

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        sendAlert: {
            type: AlertType,
            args: {
                alert: { type: GraphQLNonNull(AlertInput) },
            },
        },
    },
})

const SubscriptionType = new GraphQLObjectType({
    name: 'Subscription',
    fields: {
        newAlert: {
            type: AlertType,
            args: {
                eventId: {
                    type: GraphQLString,
                },
                slug: {
                    type: GraphQLString,
                },
            },
        },
    },
})

const Resolvers = {
    Query: {
        alerts: async (parent, args, context) => {
            const userId = context.req.user ? context.req.user.sub : null
            if (!userId) return null

            await RegistrationController.getRegistration(userId, args.eventId)

            return context.controller('Alert').find(args, userId)
        },
    },
    Mutation: {
        sendAlert: async (parent, args, context) => {
            const userId = context.req.user ? context.req.user.sub : null
            if (!userId) return null

            const event = await Event.findById(args.alert.eventId)

            if (!event.organisers.includes(userId) && event.owner !== userId) {
                throw new Error('You are not an organiser of this event')
            }

            pubsub.publish('ALERT_SENT', {
                newAlert: {
                    ...args.alert,
                    sentAt: new Date(),
                    sender: userId,
                },
            })

            return context.controller('Alert').send(args.alert, userId)
        },
    },
    Subscription: {
        newAlert: {
            subscribe: withFilter(
                () => {
                    return pubsub.asyncIterator('ALERT_SENT')
                },
                async ({ newAlert }, { eventId, slug }, { user }) => {
                    // Check authentication from context
                    const userId = user ? user.sub : null
                    if (!userId) {
                        return false
                    }

                    const id = (
                        eventId || (await Event.findOne({ slug }))._id
                    ).toString()

                    // Check if the alert was sent to the relevant event
                    if (newAlert.eventId !== id) {
                        return false
                    }
                    // Find a registration for the user and event
                    const registration =
                        await RegistrationController.getRegistration(userId, id)
                    // If no registration exists, the user is not allowed to see the alert
                    if (!registration) {
                        return false
                    }

                    return true
                },
            ),
        },
    },
}

module.exports = {
    QueryType,
    MutationType,
    SubscriptionType,
    Resolvers,
    Types: {
        AlertType,
    },
}
