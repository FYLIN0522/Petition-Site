import React from "react";
import axios from "axios";
import {Category, Delete, Edit} from "@mui/icons-material";
import {
    Box, Button, Card, CardActions, CardContent, CardMedia, Dialog,
    DialogActions, DialogContent, DialogContentText,
    DialogTitle, IconButton, TextField, Typography
} from "@mui/material";
import CSS from 'csstype';
import DeleteIcon from "@mui/icons-material/Delete";
import Petitions from "./Petitions";
import {Link, useNavigate} from "react-router-dom";
interface IPetitionProps {
    petition: Petition
}
const PetitionListObject = (props: IPetitionProps) => {
    const [petition] = React.useState <Petition> (props.petition)
    const [petitionFull, setPetitionFull] = React.useState<PetitionFull>();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [categories, setCategory] = React.useState<Array<Category>>([]);

    React.useEffect( () => {
        console.log(petition.petitionId, petition.title);
        const getPetitions = () => {
            axios.get(`http://localhost:4941/api/v1/petitions/${petition.petitionId}`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setPetitionFull(response.data);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getPetitions();
    }, []);

    React.useEffect(() => {
        const getCategory = () => {
            axios.get('http://localhost:4941/api/v1/petitions/categories')
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setCategory(response.data);

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getCategory();
    }, []);


    const getImage = () => {
        return (`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`)
    }

    const navigate = useNavigate();

    const handleBoxClick = () => {
        navigate(`/petitions/${petition.petitionId}`);
    };
    const userCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "328px",
        width: "300px",
        margin: "10px",
        padding: "0px"
    }

    return (

        <Box sx={{ maxWidth: 1200, mx: "auto", my: 2, p: 2, backgroundColor: "none"}}>

            {categories.map((category: any) => (
                (category.categoryId === petition.categoryId)  ? (<Typography key={petition.petitionId} variant="h6" sx={{ textAlign: 'left'}}> Category: {category.name}</Typography>) : null
            ))}

            <Card  onClick={handleBoxClick} sx={{maxHeight: 220,cursor: "pointer", display: "flex", boxShadow: 3 ,"&:hover": {backgroundColor: '#f4f4f4'} }}>

                <CardMedia
                    component="img"
                    sx={{ width: 220 }}
                    image={getImage()}  // Replace with actual image path
                    alt="Auction hero"
                />
                <CardContent sx={{ flex: 1}}>
                    <Typography variant="h5" color="text.primary" sx={{ textAlign: 'mid', mr: 9}}>
                        {petition.title}
                    </Typography>

                    <Typography variant="h6" color="text.secondary" sx={{mt: 1, textAlign: "left", ml: 4, fontSize: 16,  height: 80, overflow: "auto"}}>
                        {petitionFull?.description}
                    </Typography>

                    <Box  sx={{  display: "flex", justifyContent: "space-between", width: '100%', mt: 2 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ml: 2}}>
                            Supporting Cost: ${petition.supportingCost}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            {petition.ownerFirstName} {petition.ownerLastName}
                            <br/>
                            Created {new Date(petition.creationDate).toLocaleDateString()}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>

    )
}
export default PetitionListObject