import React, { useState, useEffect } from 'react'
import { Box, Typography, Divider } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import HackerpackDetail from 'components/hackerpack/HackerpackDetail'
import PageHeader from 'components/generic/PageHeader'
import PageWrapper from 'components/layouts/PageWrapper'

import HackerpackService from 'services/hackerpack'
import config from 'constants/config'
export default () => {
    const [hackerpack, setHackerpack] = useState([])

    useEffect(() => {
        HackerpackService.getFullHackerpack().then(pack => {
            if (pack) setHackerpack(pack)
        })
    }, [])

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>
            <PageHeader
                heading="Hackerpack"
                subheading="We want you to be able to fully focus on making your hackathon project as cool as possible! The following suggestions will help you unleash your creativity and maximize your learning during the hackathon. Use the roadmap for better undestanding of the learning flow."
            />
            <PageWrapper loading={false}>
                <Divider variant="middle" />
                {hackerpack.map(company => (
                    <HackerpackDetail partner={company} redeemable={true} />
                ))}
            </PageWrapper>
        </>
    )
}
