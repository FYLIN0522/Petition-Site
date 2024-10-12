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
    DialogTitle, Divider, IconButton, InputAdornment, List, ListItem, ListItemAvatar, ListItemText, Paper, Snackbar,
    TextField, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {Category, Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";

const SupportTier = () => {
    const {id, tierId} = useParams();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [supportT, setSupportT] = React.useState<supportTier>({supportTierId:-1, title: '', description: '', cost: 0})
    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
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

    const [message, setMessage] = React.useState("")
    const [isLogin, setLogin] = React.useState(false)
    const navigate = useNavigate();
    const [finishRegister, setFinishRegister] = React.useState(false);

    React.useEffect( () => {
        const getPetitionFull =  () => {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
                .then((response) => {
                    // console.log(petition);
                    // console.log(petition.supportTiers);
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetition(response.data)
                    console.log(response.data.supportTiers)

                    //response.data.supportTiers.map((tier: any) => (tier.supportTierId === tierId ? setSupportT(tier) : null))
                    response.data.supportTiers.map((tier: any) => {
                        if (tierId !== undefined ) {
                            if(tier.supportTierId === parseInt(tierId, 10))
                            setSupportT(tier)
                        }
                    })

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })

        }
        getPetitionFull();

    }, [id])


    const handleMessageEnter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSupporting = () => {
        if(authToken !== "") {
            let tid = -1;
            if(tierId !== undefined){
                const tid = parseInt(tierId, 10);
            }

            let data = {supportTierId: supportT.supportTierId, message}
            console.log(data)
            axios.post(`http://localhost:4941/api/v1/petitions/${id}/supporters`, data, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    console.log((response.data.token))
                    setErrorFlag(false)
                    setErrorMessage("")
                    setFinishRegister(true)

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
    }


    return (
        <div>

            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>}

            <Typography variant="h4" sx={{mt: 40}}>
                Supporting a Petition
            </Typography>
            <Typography variant="h5" sx={{mt: 3}}>
                {"<"}{petition.title}{">"}
            </Typography>
            {/*sx={{display: "flex", flexDirection: "column", maxWidth: 400, gap: 4, mx: "auto", mt: 40}}*/}
            <Box   sx={{mt: 1, p: 2, mx: "auto", maxWidth: 400, border: "solid"}}>
                <Typography variant="h6">
                    {supportT.title}
                </Typography>

                <Typography >
                    {supportT.description}
                </Typography>

                <Typography >
                    Cost: ${supportT.cost}
                </Typography>

            </Box>

            <TextField sx={{ mt: 4, mx: "auto", minWidth: 400}}
                label="Leave a message (Option)"
                type="string"
                value={message}
                onChange={handleMessageEnter}
            />
            <Box sx={{mt: 2, alignItems: "center"}}>
                <Button type="submit" variant="contained" sx={{ mt: 2, maxWidth: 200}} onClick={handleSupporting}>
                    Confirm supporting
                </Button>
            </Box>



            {authToken === '' ?
                <Typography variant="h5" sx={{mx: "auto", mt: 3, color: "red"}}>
                    Please log in to supporting the petition
                </Typography>
            : null}

            {finishRegister &&
                <Typography variant="h5" sx={{mx: "auto", mt: 3, color: "blue"}}>
                    Success, Thanks for your support!
                </Typography>
            }
            < Box sx={{mx: "auto", mt: 2, fontSize: 20}}>
                <Link to={ `/petitions/${id}`}> Back to petiton page </Link>
            </Box>

        </div>
    )


}

export default SupportTier;