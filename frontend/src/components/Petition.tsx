import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";

import {
    Alert, AlertTitle, Avatar, Box,
    Button, Card, CardContent, CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Snackbar,
    TextField, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {Category} from "@mui/icons-material";
import PetitionListObject from "./PetitionsListObject";

const Petition = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [petition, setPetition] = React.useState<PetitionFull>({ petitionId: 0,
                                                                                                title: '',
                                                                                                categoryId: 0,
                                                                                                creationDate: '',
                                                                                                ownerId: 0,
                                                                                                ownerFirstName: '',
                                                                                                ownerLastName: '',
                                                                                                numberOfSupporters: 0,
                                                                                                supportingCost: 0,
                                                                                                description: '',
                                                                                                moneyRaised: 0,
                                                                                                supportTiers: []})

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [supporters, setSupporters] = React.useState<Array<supporter>>([])
    // const [owner, setOwner] = React.useState<user>({id: 0,
    //                                                                                             firstName: '',
    //                                                                                             lastName: '',
    //                                                                                             email: '',
    //                                                                                             password: '',
    //                                                                                             imageFilename: '',
    //
    //                                                                                             authToken: ''})
    const [similarPetition, setSimilarPetition] = React.useState<Array<PetitionFull>>([]);
    const [showContent, setShowContent] = React.useState(false);
    const [DataLoaded, setDataLoaded] = React.useState(false);

    const Visibility = () => {
        setShowContent(!showContent);
    };

    React.useEffect( () => {

        const getPetitionFull =  () => {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
                .then((response) => {
                    // console.log(petition);
                    //console.log(response);
                    // console.log(petition.supportTiers);
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetition(response.data)

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })

        }
        getPetitionFull();

    }, [id])


    React.useEffect( () => {
        const getSimilarPetition =  () => {
            axios.get(`http://localhost:4941/api/v1/petitions?categoryIds=${petition.categoryId}`)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setSimilarPetition(response.data.petitions);

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getSimilarPetition();
    }, [petition])


    React.useEffect(() => {
        const getSupporters =  () => {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`)
                .then((response) => {
                    console.log(1111111111111111111111);
                    console.log(response);
                    // console.log(petition.supportTiers);
                    setErrorFlag(false)
                    setErrorMessage("")
                    setSupporters(response.data)


                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getSupporters();
    }, [id])




    const getOwnerImage = () => {
        if(petition){
            return (`http://localhost:4941/api/v1/users/${petition.ownerId}/image`)
        } else {
            return ("https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png")
        }
    }

    const getPetitionImage = () => {
        return (`http://localhost:4941/api/v1/petitions/${id}/image`)
    }

    const getSupporterImage = (supporter: supporter) => {
        if(petition) {
            return (`http://localhost:4941/api/v1/users/${supporter.supporterId}/image`)
        }
    }
    const getImage = () => {
        return (`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`)
    }

    const showSimilarPetition = () => {

        if (!Array.isArray(similarPetition)) {
            return null;
        }

         return similarPetition.map((p: Petition) =>{
             if(p.petitionId !== petition.petitionId) {
                 return <PetitionListObject key={p.petitionId + p.title} petition={p}/>
             }
         });
    };


    const handleBoxClick = (sid: number) => {
        navigate(`/petitions/${petition.petitionId}/${sid}`);
    };

    return (
        <Paper elevation={3} sx={{boxShadow: "none", p: 2, maxWidth: 1200, mx: "auto"}}>
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>}

            <Box sx={{display: "flex", ml: "auto", mt: 4}}>
                <Link to={"/"}>Back to petitions page</Link>
            </Box>

            <Box sx={{ display: "flex", mt: 2 }}>

                <Box sx={{ flex: "1 1 35%", pr: 2 }}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="350"
                            image={getPetitionImage()}
                            alt="Hero Image"
                        />
                    </Card>
                </Box>
                <Box sx={{ flex: "1 1 60%" }}>
                    <Typography variant="h4" color="text.primary">
                        {petition.title}
                    </Typography>
                    <Typography variant="body1"  sx={{mt: 1, textAlign: "left", ml: 4, fontSize: 18}}>
                        {petition.description}
                    </Typography>
                    <Typography color="textSecondary" sx={{ml: 4, mt: 4, textAlign: "left", fontSize: 20}}>
                        Number of supporters: {petition.numberOfSupporters}
                    </Typography>
                    <Typography color="textSecondary" sx={{ml: 4, textAlign: "left", fontSize: 20}}>
                        Total money raised: ${petition.moneyRaised}
                    </Typography>
                </Box>

            </Box>


            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Avatar
                    src={getOwnerImage()}
                    alt={`${petition.ownerFirstName} ${petition.ownerLastName}`}
                    sx={{ width: 60, height: 60 }}
                />
                <Box sx={{ml: 3}}>
                    <Typography sx={{fontSize:20}} >{petition.ownerFirstName} {petition.ownerLastName}</Typography>
                </Box>
                <Box sx={{ml: 2}}>
                    <Typography sx={{fontSize:14}} color="textSecondary">Created on: {new Date(petition.creationDate).toLocaleDateString()}</Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 1, mr: 4, maxWidth: 440 }}>
                <Typography variant="h5">
                    Support Tiers
                </Typography>

                {petition.supportTiers.map((tier: any) => (
                    <Box key={tier.supportTierId}  onClick={() => handleBoxClick(tier.supportTierId)}  sx={{ mt: 2, p: 2, border: "solid", cursor: "pointer", "&:hover": {backgroundColor: '#f4f4f4'}}}>
                        <Typography variant="h6">
                            {tier.title}
                        </Typography>

                        <Typography >
                            {tier.description}
                        </Typography>

                        <Typography >
                            Cost: ${tier.cost}
                        </Typography>

                    </Box>
                ))}
            </Box>

            <Box sx={{maxWidth: 440 }}>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{color: "blue"}}>
                        Supporters
                    </Typography>
                    <Button variant="outlined" onClick={Visibility} sx={{maxHeight: 20, maxWidth: 120, fontSize: 10}}>
                        {showContent ? "Hide Content" : "Show Content"}
                    </Button>
                    {/*<Divider variant="middle" color="text.primary" component="li" sx={{ listStyleType: "none", mt: 1}} />*/}
                </Box>



                {showContent && (supporters.map((supporter: any) => (
                    <Box key={supporter.supportId} sx={{ mt: 0, p: 2 }}>
                        <Divider variant="middle" color="text.primary" component="li" sx={{ listStyleType: "none"}} />
                        <Avatar
                            src={getSupporterImage(supporter)}
                            alt={`${supporter.supporterFirstName} ${supporter.supporterLastName}`}
                            sx={{ width: 50, height: 50, mt:1}}
                        />
                        {petition.supportTiers.map((tier: any) => (
                            (supporter.supportTierId === tier.supportTierId)  ? (<Typography variant="h6"> {tier.title}</Typography>) : null

                        ))}

                        <Typography >
                            {supporter.message}
                        </Typography>

                        <Typography >
                            {supporter.supporterFirstName} {supporter.supporterLastName}
                        </Typography>
                        <Typography >
                            Created {new Date(supporter.timestamp).toLocaleDateString()}
                        </Typography>

                    </Box>
                )))}

            </Box>

            <Box sx={{ md: "auto", ml: "auto", mt: 7}}>
                <Typography variant="h5" sx={{ ml: 2, textAlign: 'left'}}>
                    Similar Petition
                </Typography>
                <Divider variant="middle" color="text.primary" component="li" sx={{ listStyleType: "none"}} />
                {showSimilarPetition()}
            </Box>

        </Paper>
    )




}

export default Petition;