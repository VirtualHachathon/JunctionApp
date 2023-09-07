import React, { useState, useEffect } from 'react'
import { Box, Typography, Divider, Button } from '@material-ui/core'

import HackerpackDetail from 'components/hackerpack/HackerpackDetail'
import PageHeader from 'components/generic/PageHeader'
import Footer from 'components/layouts/Footer'
import PageWrapper from 'components/layouts/PageWrapper'
import GlobalNavBar from 'components/navbars/GlobalNavBar'
import Container from 'components/generic/Container'
import { useDispatch } from 'react-redux'
import { push } from 'connected-react-router'
import { makeStyles } from '@material-ui/core/styles'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { Helmet } from 'react-helmet'
import config from 'constants/config'

import HackerpackService from 'services/hackerpack'

const useStyles = makeStyles(theme => ({
    wrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(3),
        background: 'black',
        color: 'white',
    },
}))

export default () => {
    const dispatch = useDispatch()
    const classes = useStyles()

    const [hackerpack, setHackerpack] = useState([])

    useEffect(() => {
        HackerpackService.getFullHackerpack().then(pack => {
            if (pack) setHackerpack(pack)
        })
    }, [])

    return (
        <PageWrapper
            loading={false}
            header={() => <GlobalNavBar />}
            footer={() => <Footer />}
        >
            <Helmet>
                <title>{config.PLATFORM_OWNER_NAME}</title>
            </Helmet>
            <Container center wrapperClass={classes.backButtonWrapper}>
                <Button onClick={() => dispatch(push('/'))}>
                    <ArrowBackIosIcon style={{ color: 'black' }} />
                    <Typography variant="button" style={{ color: 'black' }}>
                        Back
                    </Typography>
                </Button>
            </Container>
            <Container center>
                <PageHeader
                    heading="Hackerpack"
                    subheading="We want you to be able to fully focus on making your hackathon project as cool as possible! The following suggestions will help you unleash your creativity and maximize your learning during the hackathon. Use the roadmap for better undestanding of the learning flow."
                />
                <Divider variant="middle" />
                {hackerpack.map(company => (
                    <HackerpackDetail partner={company} />
                ))}
            </Container>
        </PageWrapper>
    )
}
