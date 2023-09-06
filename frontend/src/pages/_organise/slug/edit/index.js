import React from 'react'

import yupSchema from '@hackjunction/shared/schemas/validation/eventSchema'

import { Formik } from 'formik'
import { useSelector, useDispatch } from 'react-redux'
import { forOwn } from 'lodash-es'
import { useRouteMatch, useLocation } from 'react-router'
import * as OrganiserSelectors from 'redux/organiser/selectors'
import * as OrganiserActions from 'redux/organiser/actions'
import * as SnackbarActions from 'redux/snackbar/actions'
import PageHeader from 'components/generic/PageHeader'
import PageWrapper from 'components/layouts/PageWrapper'
import MaterialTabsLayout from 'components/layouts/MaterialTabsLayout'
import BottomBar from 'components/inputs/BottomBar'

import DefaultTab from './default'
import ConfigurationTab from './configuration'
import ChallengesTab from './challenges'
import ScheduleTab from './schedule'
import QuestionsTab from './questions'
import SubmissionFormTab from './submission'
import TimelineTab from './timeline'
import MeetingRoomsTab from './meetingRooms'
import OtherTab from './other'
import { useMutation } from '@apollo/client'
import { UPDATE_EVENT } from 'graphql/mutations/eventOps'

export default () => {
    const dispatch = useDispatch()
    // lhello
    const [saveChanges, saveResult] = useMutation(UPDATE_EVENT, {
        onError: err => {
            const errors = err.graphQLErrors

            if (errors) {
                dispatch(
                    SnackbarActions.error('Unable to save changes', {
                        errorMessages: Object.keys(errors).map(
                            key => `${key}: ${errors[key].message}`,
                        ),
                        persist: true,
                    }),
                )
            } else {
                dispatch(SnackbarActions.error('Unable to save changes'))
            }
        },
        onCompleted: () => {
            dispatch(OrganiserActions.updateEvent(slug)).then(() =>
                dispatch(
                    SnackbarActions.success(
                        'Your changes were saved successfully',
                    ),
                ),
            )
        },
    })
    const match = useRouteMatch()
    const location = useLocation()

    const event = useSelector(OrganiserSelectors.event)
    const loading = useSelector(OrganiserSelectors.eventLoading)
    const { slug, _id } = event

    function onSubmit(values, actions) {
        const changed = {}
        forOwn(values, (value, field) => {
            if (event[field] !== value) {
                changed[field] = value
            }
        })
        saveChanges({
            variables: { _id, input: changed },
        })
        actions.setSubmitting(false)
    }
    return (
        <PageWrapper loading={loading}>
            <PageHeader
                heading="Edit event"
                subheading="Configure event information, schedule and other settings"
            />
            
            <div style={{ padding: 16 }}>
                <a style={{ display: 'inline-block', marginBottom: 20 }} href="https://virtualhackathon.eu/en/roadmaps-home" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" height="18" style={{ verticalAlign: 'middle', marginRight : 5 }}><path d="M384 476.1L192 421.2V35.9L384 90.8V476.1zm32-1.2V88.4L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3V394.6c0 9.8-6 18.6-15.1 22.3L416 474.8zM15.1 95.1L160 37.2V423.6L32.9 474.5C17.1 480.8 0 469.2 0 452.2V117.4c0-9.8 6-18.6 15.1-22.3z"/></svg>
                    I want to create or find a roadmap
                </a>
            </div>
            
            <Formik
                initialValues={
                    saveResult.data ? saveResult.data.updateEvent : event
                }
                enableReinitialize={true}
                onSubmit={onSubmit}
                validationSchema={yupSchema}
            >
                {formikProps => (
                    <>
                        <MaterialTabsLayout
                            transparent
                            tabs={[
                                {
                                    path: '',
                                    key: 'basic-details',
                                    label: 'Basic Details',
                                    component: DefaultTab,
                                },
                                {
                                    path: '/configuration',
                                    key: 'configuration',
                                    label: 'Configuration',
                                    component: ConfigurationTab,
                                },
                                {
                                    path: '/challenges',
                                    key: 'challenges',
                                    label: 'Challenges',
                                    component: ChallengesTab,
                                },
                                {
                                    path: '/schedule',
                                    key: 'schedule',
                                    label: 'Schedule',
                                    component: ScheduleTab,
                                },
                                {
                                    path: '/timeline',
                                    key: 'timeline',
                                    label: 'Timeline',
                                    component: TimelineTab,
                                },
                                {
                                    path: '/rooms',
                                    key: 'meetingRooms',
                                    label: 'Meeting Rooms',
                                    component: MeetingRoomsTab,
                                },
                                {
                                    path: '/questions',
                                    key: 'questions',
                                    label: 'Questions',
                                    component: QuestionsTab,
                                },
                                {
                                    path: '/submission',
                                    key: 'submission',
                                    label: 'Submission form',
                                    component: SubmissionFormTab,
                                },
                                {
                                    path: '/other',
                                    key: 'other',
                                    label: 'Miscellaneous',
                                    component: OtherTab,
                                },
                            ]}
                            location={location}
                            baseRoute={match.url}
                        />
                        <div style={{ height: '100px' }} />
                        <BottomBar
                            onSubmit={formikProps.handleSubmit}
                            errors={formikProps.errors}
                            dirty={formikProps.dirty}
                            loading={saveResult.loading}
                        />
                    </>
                )}
            </Formik>
        </PageWrapper>
    )
}
