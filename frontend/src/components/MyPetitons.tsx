import axios from 'axios';
import React from "react";
import Petition from "./Petition";
import {
    Alert,
    AlertTitle, Avatar,
    Box,
    Button, Divider,
    FormControl,
    IconButton,
    InputAdornment, InputLabel, MenuItem,
    Paper, Select, SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {red} from "@mui/material/colors";
import {Category, Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";
import PetitionListObject from "./PetitionsListObject";



const MyPetitons = () =>{
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const [myPetitons, setMyPetitons] = React.useState<Array<Petition>>([]);
    const [mySupport, setMySupport] = React.useState<Array<Petition>>([]);
    const [myDetails, setMyDetails] = React.useState({firstName: '', lastName: '', email: ''});

    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)
    const navigate = useNavigate();
    const [valid, setValid] = React.useState(true);

    React.useEffect(() => {
        const getMyPetitons = () => {
            if(authToken === ''){
                setValid(false)
            }
            axios.get(`http://localhost:4941/api/v1/petitions?ownerId=${userId}`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setMyPetitons(response.data.petitions);

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getMyPetitons();
    }, []);

    React.useEffect(() => {
        const getMyDetails = () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}`, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    console.log(response)
                    setErrorFlag(false);
                    setErrorMessage("");
                    setMyDetails(response.data);

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getMyDetails();
    }, []);

    const handleEditClick = (id: number) => {
        navigate(`/edit/${id}`);
    };
    const petition_rows = () => myPetitons.map((petition: Petition) => <Box key={petition.petitionId + petition.title + petition.creationDate} sx={{mt: 4}}>
                                                                            <PetitionListObject key={petition.petitionId + petition.title} petition={petition}/>
                                                                            <Button type="submit" variant="outlined" sx={{ml:135, fontSize:16}} onClick={() => handleEditClick(petition.petitionId)}>
                                                                                Edit
                                                                            </Button>
                                                                        </Box>);

    const support_rows = () => myPetitons.map((petition: Petition) => <PetitionListObject key={petition.petitionId + petition.title} petition={petition}/>)
    const createPage = () => {
        navigate(`/create`);
    };
    const editPage = () => {
        navigate(`/editProfile`);
    };

    return (
        <div>

            {valid && <Paper elevation={3} sx={{boxShadow: "none", p: 2, maxWidth: 1600, mx: "auto"}}>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}

                <Box sx={{textAlign: "left", mt: 1}}>
                    <Link to={"/"}>Back to petitions page</Link>
                </Box>


                <Box sx={{display: "flex", mt: 4, gap: 2}}>
                    <Box sx={{
                        display: "flex",
                        flex: "1 1 17%",
                        minHeight: 350,
                        pr: 2,
                        backgroundColor: "#f5f5f5",
                        flexDirection: 'column',
                        overflowX: 'scroll'
                    }}>
                        <Box sx={{display: "flex", justifyContent: 'center', mt: 2}}>
                            <Avatar
                                src={`http://localhost:4941/api/v1/users/${userId}/image`}
                                alt={`${myDetails.firstName} ${myDetails.lastName}`}
                                sx={{width: 150, height: 150}}
                            />
                        </Box>

                        <Typography variant="h6" sx={{mt: 1, textAlign: 'center'}}>
                            {myDetails?.firstName} {myDetails?.lastName}
                        </Typography>

                        <Typography sx={{textAlign: 'center', fontSize: 15}}>
                            {myDetails?.email}
                        </Typography>

                        <Button type="submit" variant="text" sx={{mr: "auto", ml: 2, mt: 4, height: 20}}
                                onClick={editPage}>
                            Edit profile
                        </Button>
                        <Button type="submit" variant="text" sx={{mr: "auto", ml: 2, mt: 1, height: 20}}
                                onClick={createPage}>
                            Create petiton
                        </Button>

                    </Box>

                    <Box sx={{display: "flex", flex: "1 1 83%", pr: 2, flexDirection: 'column'}}>
                        <Typography variant="h4" sx={{mr: 'auto', ml: 1}}>
                            My Petitons
                        </Typography>
                        <Divider variant="middle" color="text.primary" component="li"
                                 sx={{listStyleType: "none", mt: 2}}/>
                        {petition_rows()}

                        {/*<Typography variant="h4" sx={{mr: 'auto', ml: 1}}>*/}
                        {/*    Petitons I am supporting*/}
                        {/*</Typography>*/}
                        {/*<Divider variant="middle" color="text.primary" component="li" sx={{ listStyleType: "none", mt: 2 }} />*/}

                    </Box>
                </Box>

            </Paper>
            }

            {!valid ? <Typography variant="h3" sx={{mt: 8, color: "red"}}> Please log in first </Typography> : null}
        </div>
    )
}


export default MyPetitons;