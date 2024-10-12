import axios from 'axios';
import React from "react";
import Petition from "./Petition";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment, InputLabel, MenuItem,
    Paper, Select, SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import {Link} from "react-router-dom";
import {red} from "@mui/material/colors";
import {Category, Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";



const CreatePetiton = () =>{

    const [data, setData] = React.useState({title: '',
                                                                                                            description: '',
                                                                                                            categoryId: 0})


    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState('')

    const [errors, setError] = React.useState({title: '',
                                                                                                            description: '',
                                                                                                            categoryId: '',
                                                                                                            supportTierTitle: '',
                                                                                                            supportTierDescription: '',
                                                                                                            supportTierCost: '',
                                                                                                            supportTierEmpty: '',
                                                                                                                supportTier2D:'',
                                                                                                                supportTier2T:'',
                                                                                                                supportTier3D:'',
                                                                                                                supportTier3T:'',
                                                                                                                image:''})

    const [finishCreate, setFinishCreate] = React.useState(false);
    const [categories, setCategory] = React.useState<Array<Category>>([]);
    const [selectCategory, setSelectCategory] = React.useState('');

    const [supportTier1, setSupportTier1] = React.useState({ title: '', description: '', cost: 0 });
    const [supportTier2, setSupportTier2] = React.useState({ title: '', description: '', cost: 0 });
    const [supportTier3, setSupportTier3] = React.useState({ title: '', description: '', cost: 0 });
    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)

    const [image, setImage] = React.useState<File>()
    const [imageDetail, setImageDetail] = React.useState({name: '', type: ''})

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
    }, [setCategory]);


    const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, title: event.target.value});
    };
    const handleDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, description: event.target.value});
    };

    const handleCategoryId = (event: SelectChangeEvent<string>) => {
        categories.map((category : Category) =>{
            if(category.name === event.target.value){
                setData({...data, categoryId: category.categoryId})
                setSelectCategory(category.name)
            }
        })
    };

    const handleSupportTier1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        //console.log(event.target);
        const { name, value } = event.target
        setSupportTier1({...supportTier1, [name]: name === "cost" ? parseInt(value) : value})
    };

    const handleSupportTier2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setSupportTier2({...supportTier2, [name]: name === "cost" ? parseInt(value) : value})
    };

    const handleSupportTier3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        // if(name === "cost"){
        //     value = parseInt(value, 10)
        // }
        setSupportTier3({...supportTier3, [name]: name === "cost" ? parseInt(value) : value})
    };

    const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file){
            setImage(file)
            setImageDetail({name: file.name, type: file.type})
        }
    };

    const checkValid = () => {
        let error = {title: '',
                                            description: '',
                                            categoryId: '',
                                            supportTierTitle: '',
                                            supportTierDescription: '',
                                            supportTierCost: '',
                                            supportTierEmpty: '',
                                            supportTier2D:'',
                                            supportTier2T:'',
                                            supportTier3D:'',
                                            supportTier3T:'',
                                            image:''}

        let valid = true;
        let supportTierArray = []

        if(data.title === ''){
            error.title = "Title is required"
            valid = false;
        }
        if(data.description === ''){
            error.description = "Description is required"
            valid = false;
        }
        if(data.categoryId === 0){
            error.categoryId = "Category Id is required"
            valid = false;
        }

        if(data.categoryId === 0){
            error.categoryId = "Category id is required"
            valid = false;
        }

        if(supportTier1.title === ''){
            error.supportTierTitle = "Title is required"
            valid = false;
        }
        if(supportTier1.description === ''){
            error.supportTierDescription = "Description is required"
            valid = false;
        }

        if(imageDetail.name === ''){
            error.image = "Image is required"
            valid = false;
        }

        if(supportTier1.title === '' || supportTier1.description === ''){
            error.supportTierEmpty = "Please finish the first support tier"
            valid = false;

        } else {
            if (supportTier2.title === '' && supportTier2.description !== ''){
                error.supportTier2T = "Title is required"
                valid = false;
            }  else if (supportTier2.title !== '' && supportTier2.description === ''){
                error.supportTier2D = "Description is required"
                valid = false;
            }

            if (supportTier3.title === '' && supportTier3.description !== ''){
                error.supportTier3T = "Title is required"
                valid = false;
            } else if (supportTier3.title !== '' && supportTier3.description === ''){
                error.supportTier3D = "Description is required"
                valid = false;
            }
        }

        setError(error)
        console.log(imageDetail.name)
        return valid
    }

    const handleRegister = () => {
        console.log(checkValid())
        if(checkValid()){
            let supportTierArray = []
            supportTierArray.push(supportTier1)
            if(errors.supportTier2D === '' && errors.supportTier2T === '' && supportTier2.title !== '' && supportTier2.description !== '') {
                supportTierArray.push(supportTier2)
            }
            if(errors.supportTier3D === '' && errors.supportTier3T === '' && supportTier3.title !== '' && supportTier3.description !== '') {
                supportTierArray.push(supportTier3)
            }
            const fullData = {title: data.title, description: data.description, categoryId: data.categoryId, supportTiers: supportTierArray}
            console.log(fullData)
            axios.post(`http://localhost:4941/api/v1/petitions`, fullData, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    console.log(response)
                    if(imageDetail.name !== '')
                    {
                        console.log((image))
                        axios.put(`http://localhost:4941/api/v1/petitions/${response.data.petitionId}/image`, image, {headers: {'X-Authorization': authToken,
                                                                                                                    "Content-Type":   imageDetail.type}})
                            .then((response) => {
                                console.log((response))
                                setErrorFlag(false)
                                setErrorMessage("")
                                setFinishCreate(true)
                            }, (error) => {
                                setErrorFlag(true)
                                setErrorMessage(error.toString())
                            })
                    }
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())

                })

        }
    }

    return(
        <Paper elevation={3} sx={{boxShadow: "none", p: 2, maxWidth: 1200, mx: "auto"}}>
            {errorFlag &&
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>}
            <Box sx={{ textAlign: "left", mt: 1}}>
                <Link to={"/"} >Back to petitions page</Link>
            </Box>

            {authToken === "" ? <Typography variant="h4" sx={{mt: 0, color: "red"}}> You need to log in first </Typography> : null}

            {!finishCreate &&
                <Box sx={{display: "flex", flexDirection: "column", maxWidth: 600, gap: 4, mr: "auto", mt: 4}}>
                    <Box sx={{display: "flex", flexDirection: "row"}}>
                        <Typography variant="h4" sx={{mr: "auto", ml: 1}}>
                            Create petiton
                        </Typography>

                        <Button sx={{mt: 1,}}
                                variant="contained"
                                component="label"
                        >
                            Upload Photo
                            <input
                                type="file"
                                accept= "image/png, image/gif, image/jpeg"
                                onChange={handleImage}
                                hidden
                            />
                        </Button>
                    </Box>
                    {imageDetail.name !== '' ?  <Typography sx={{ml:"auto", fontSize: 14}}> image: {imageDetail.name} </Typography> : null}


                    <TextField
                        label="Title"
                        type="string"
                        value={data.title}
                        onChange={handleTitle}
                        helperText={errors.title}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{ '& .MuiInputBase-input': { fontWeight: "bold" }, '& .MuiInputLabel-root': { fontWeight: "bold" } }}

                    />
                    <TextField
                        label="Description"
                        type="string"
                        value={data.description}
                        onChange={handleDescription}
                        helperText={errors.description}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{ '& .MuiInputBase-input': { fontWeight: "bold" }, '& .MuiInputLabel-root': { fontWeight: "bold" } }}
                    />

                    <FormControl>
                        <InputLabel id="categoryLabel" sx={{fontWeight: "bold"}}>Category</InputLabel>
                        <Select
                            labelId="categoryLabel"
                            label="Category"
                            value={selectCategory}
                            onChange={handleCategoryId}
                        >
                            <MenuItem value="">Category</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.categoryId} value={cat.name}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {errors.categoryId !== '' ?  (<Typography sx={{mr: 'auto', fontSize: 16, color: "red"}}> {errors.categoryId} </Typography>): null}

                    <Typography variant="h6" sx={{mr: 'auto'}}>
                        Support Tier
                    </Typography>
                    <TextField
                        label="title"
                        name="title"
                        type="string"
                        value={supportTier1.title}
                        onChange={handleSupportTier1}
                        helperText={errors.supportTierTitle}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{ '& .MuiInputBase-input': { fontWeight: "bold" }, '& .MuiInputLabel-root': { fontWeight: "bold" } }}
                    />
                    <TextField
                        label="description"
                        name="description"
                        type="string"
                        value={supportTier1.description}
                        onChange={handleSupportTier1}
                        helperText={errors.supportTierDescription}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{ '& .MuiInputBase-input': { fontWeight: "bold" }, '& .MuiInputLabel-root': { fontWeight: "bold" } }}
                    />
                    <TextField
                        label="cost"
                        name="cost"
                        type="number"
                        value={supportTier1.cost}
                        onChange={handleSupportTier1}
                        helperText={errors.supportTierCost}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{
                            input: {
                                color: supportTier1.cost === 0 ? "lightgray" : "black"
                            }
                        }}
                    />


                    <Typography variant="h6" sx={{mr: 'auto'}}>
                        Support Tier (Option)
                    </Typography>
                    <TextField
                        label="title (Option)"
                        name="title"
                        type="string"
                        value={supportTier2.title}
                        onChange={handleSupportTier2}
                        helperText={errors.supportTier2T}
                        FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField
                        label="description (Option)"
                        name="description"
                        type="string"
                        value={supportTier2.description}
                        onChange={handleSupportTier2}
                        helperText={errors.supportTier2D}
                        FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField
                        label="cost"
                        name="cost"
                        type="number"
                        value={supportTier2.cost}
                        inputProps={{ min: 0 }}
                        onChange={handleSupportTier2}
                        //helperText={errors.supportTier2}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{
                            input: {
                                color: supportTier2.cost === 0 ? "lightgray" : "black"
                            }
                        }}
                    />


                    <Typography variant="h6" sx={{mr: 'auto'}}>
                        Support Tier (Option)
                    </Typography>
                    <TextField
                        label="title (Option)"
                        name="title"
                        type="string"
                        value={supportTier3.title}
                        onChange={handleSupportTier3}
                        helperText={errors.supportTier3T}
                        FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField
                        label="description (Option)"
                        name="description"
                        type="string"
                        value={supportTier3.description}
                        onChange={handleSupportTier3}
                        helperText={errors.supportTier3D}
                        FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField
                        label="cost"
                        name="cost"
                        type="number"
                        value={supportTier3.cost}
                        inputProps={{ min: 0 }}
                        onChange={handleSupportTier3}
                        //helperText={errors.supportTier3}
                        FormHelperTextProps={{sx: {color: "red"}}}
                        sx={{
                            input: {
                                color: supportTier3.cost === 0 ? "lightgray" : "black"
                            }
                        }}
                    />

                </Box>
            }



            {!finishCreate &&
                <Button type="submit" variant="contained" sx={{mr: 8, mt: 4}} onClick={handleRegister}>
                    Create
                </Button>

            }
            {imageDetail.name === '' ?  <Typography sx={{mr:7, fontSize: 16, color:"red"}}> {errors.image} </Typography> : null}

            {finishCreate &&
                <Typography variant="h3" sx={{mt: 8}}>
                    Creation is successful
                </Typography>
            }

        </Paper>
    )
}


export default CreatePetiton;