import axios from 'axios';
import React from "react";
import Petition from "./Petition";
import {
    Alert,
    AlertTitle,
    Box,
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    FormControl,
    IconButton,
    InputAdornment, InputLabel, MenuItem,
    Paper, Select, SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import {Link, useNavigate, useParams} from "react-router-dom";
import {red} from "@mui/material/colors";
import {Category, Delete, Edit, Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";
import petition from "./Petition";
import DeleteIcon from "@mui/icons-material/Delete";



const EditPetiton = () =>{
    const {id} = useParams();
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
    const [petitionDetail, setPetitionDetail] = React.useState<PetitionFull>();

    const [data, setData] = React.useState({title: '',
                                                                                                        description: '',
                                                                                                        categoryId: 0})

    const [supportTier1, setSupportTier1] = React.useState<supportTier>({supportTierId:0, title: '', description: '', cost: 0 });
    const [supportTier2, setSupportTier2] = React.useState<supportTier>({supportTierId: 0, title: '', description: '', cost: 0});
    const [supportTier3, setSupportTier3] = React.useState<supportTier>({supportTierId: 0, title: '', description: '', cost: 0});

    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const navigate = useNavigate();
    const [image, setImage] = React.useState<File>()
    const [imageDetail, setImageDetail] = React.useState({name: '', type: ''})
    const [supportTier1Title, setSupportTier1Title] = React.useState('');
    const [supportTier2Title, setSupportTier2Title] = React.useState('');
    const [supportTier3Title, setSupportTier3Title] = React.useState('');

    const [checkOwner, setCheckOwner]= React.useState(true);
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)

    React.useEffect(() => {
        const getPetition = () => {
            axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setPetitionDetail(response.data);
                    console.log(response.data)
                    if(response.data.ownerId !== userId){
                        setCheckOwner(false)
                    }
                    setData(data => ({...data, description: response.data.description}))
                    setData(data => ({...data, title: response.data.title}))
                    setData(data => ({...data, categoryId: response.data.categoryId}))
                    // getCategoryName(response.data.categoryId);

                    setSupportTier1(response.data.supportTiers[0])
                    setSupportTier1Title(response.data.supportTiers[0].title)
                    if(response.data.supportTiers[1] !== undefined){
                        setSupportTier2(response.data.supportTiers[1])
                        setSupportTier2Title(response.data.supportTiers[0].title)
                    }
                    if(response.data.supportTiers[2] !== undefined){
                        setSupportTier3(response.data.supportTiers[2])
                        setSupportTier3Title(response.data.supportTiers[0].title)
                    }
                    //console.log(data)
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getPetition();
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
    }, [setCategory]);

    React.useEffect(() => {
        const getCategoryName = () => {
            categories.map((category : Category) =>{
                if(category.categoryId === data.categoryId){
                    setSelectCategory(category.name)
                }
            })
        };
        //console.log(data)
        getCategoryName();
    }, [data]);



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
            error.categoryId = "Category Id is required"
            valid = false;
        }


        if(supportTier1.title === '' || supportTier1.description === ''){
            error.supportTierEmpty = "Please complete the first support tier"
            valid = false;
        } else {
            if (supportTier1.title === '' && supportTier1.description !== ''){
                error.supportTierTitle = "Title is required"
                valid = false;
            }  else if (supportTier1.title !== '' && supportTier1.description === ''){
                error.supportTierDescription = "Description is required"
                valid = false;
            }

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
        return valid
    }

    const handleEdit = () => {
        console.log(checkValid())
        if(checkValid()){
            axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, data, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())

                })
            //----imageDetail-------------------------------------------------------------------------
            console.log((imageDetail.name))
            console.log((authToken))
            if(imageDetail.name !== '')
            {
                axios.put(`http://localhost:4941/api/v1/petitions/${id}/image`, image, {headers: {'X-Authorization': authToken,
                                                                                                            "Content-Type":   imageDetail.type}})
                    .then((response) => {
                        console.log((response))
                        setErrorFlag(false)
                        setErrorMessage("")
                    }, (error) => {
                        setErrorFlag(true)
                        setErrorMessage(error.toString())

                    })
            }
            //----ST-------------------------------------------------------------------------
            let supportTierArray = []
            supportTierArray.push(supportTier1)
            supportTierArray.push(supportTier2)
            supportTierArray.push(supportTier3)
            for(let i = 0; i < supportTierArray.length; i++){
                console.log(supportTierArray[i])
                if(supportTierArray[i].supportTierId === 0 && supportTierArray[i].title !== '' && supportTierArray[i].description !== ''){
                    // console.log(supportTierArray[i])
                    axios.put(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/`, supportTierArray[i], {headers: {'X-Authorization': authToken}})
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")

                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())

                        })

                } else if(supportTierArray[i].supportTierId !== 0 && supportTierArray[i].title === '' && supportTierArray[i].description === ''){
                    axios.delete(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${supportTierArray[i].supportTierId}`,{headers: {'X-Authorization': authToken}})
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")

                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())

                        })

                } else if(supportTierArray[i].supportTierId !== 0 && supportTierArray[i].title !== '' && supportTierArray[i].description !== ''){
                    axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${supportTierArray[i].supportTierId}`, supportTierArray[i], {headers: {'X-Authorization': authToken}})
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")
                            //console.log(1111111111111111111111111111111111111111)
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())

                        })
                }

            }
        }
        if(errorMessage === ''){
            setFinishCreate(true)
        }
    }

    const deleteUser = () => {
        console.log(authToken)
        axios.delete(`http://localhost:4941/api/v1/petitions/${id}`, {headers: {'X-Authorization': authToken}})
            .then(() => {
                setErrorFlag(false)
                setErrorMessage("")
                navigate(`/myPetiton/`);
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    return(
        <div>
            {checkOwner && <Paper elevation={3} sx={{boxShadow: "none", p: 2, maxWidth: 1200, mx: "auto"}}>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}

                <Box sx={{ textAlign: "left", mt: 1}}>
                    <Link to={"/myPetiton"} >Back to My petitons page</Link>
                </Box>


                {!finishCreate &&
                    <Box sx={{display: "flex", flexDirection: "column", maxWidth: 600, gap: 4, mr: "auto", mt: 4}}>
                        <Box sx={{display: "flex", flexDirection: "row"}}>
                            <Typography variant="h4" sx={{mr: 'auto', ml: 1}}>
                                Edit
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

                        />
                        <TextField
                            label="Description"
                            type="string"
                            value={data.description}
                            onChange={handleDescription}
                            helperText={errors.description}
                            FormHelperTextProps={{sx: {color: "red"}}}
                        />

                        <FormControl>
                            <InputLabel id="categoryLabel">Category: any</InputLabel>
                            <Select
                                labelId="categoryLabel"
                                label="Category: any"
                                value={selectCategory}
                                onChange={handleCategoryId}
                            >
                                <MenuItem value="">Category: any</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.categoryId} value={cat.name}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {errors.categoryId !== '' ?  (<Typography sx={{mr: 'auto', fontSize: 16, color: "red"}}> {errors.categoryId} </Typography>): null}



                        <Typography variant="h6" sx={{mr: 'auto'}}>
                            Support Tier (main)
                        </Typography>
                        <TextField
                            label="title"
                            name="title"
                            type="string"
                            value={supportTier1.title}
                            onChange={handleSupportTier1}
                            helperText={errors.supportTierTitle}
                            FormHelperTextProps={{sx: {color: "red"}}}
                        />
                        <TextField
                            label="description"
                            name="description"
                            type="string"
                            value={supportTier1.description}
                            onChange={handleSupportTier1}
                            helperText={errors.supportTierDescription}
                            FormHelperTextProps={{sx: {color: "red"}}}
                        />
                        <TextField
                            label="cost"
                            name="cost"
                            type="number"
                            InputProps={{ inputProps: { min: 0} }}
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
                            Support Tier
                        </Typography>
                        <TextField
                            label="title "
                            name="title"
                            type="string"
                            value={supportTier2.title}
                            onChange={handleSupportTier2}
                            helperText={errors.supportTier2T}
                            FormHelperTextProps={{sx: {color: "red"}}}
                        />
                        <TextField
                            label="description"
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
                            Support Tier
                        </Typography>
                        <TextField
                            label="title "
                            name="title"
                            type="string"
                            value={supportTier3.title}
                            onChange={handleSupportTier3}
                            helperText={errors.supportTier3T}
                            FormHelperTextProps={{sx: {color: "red"}}}
                        />
                        <TextField
                            label="description"
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
                    <Box sx={{display: "flex", justifyContent: "flex-front", gap: 56, mt:4}}>
                        <Button variant="text" sx={{color: "red"}} onClick={() => {setOpenDeleteDialog(true)}} startIcon={<DeleteIcon />}>
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={handleEdit}>
                            Edit
                        </Button>

                    </Box>
                }
                <Typography  sx={{mr: 27, color:"red"}}>
                    {errors.supportTierEmpty}
                </Typography>


                {finishCreate &&
                    <Typography variant="h3" sx={{mt: 8}}>
                        Edit {errorMessage!== ''? errorMessage : 'success'}
                    </Typography>
                }

                <Dialog
                    open={openDeleteDialog}
                    onClose={handleDeleteDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Delete User?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this user?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>

                        <Button variant="outlined" color="error" onClick={() => {
                            deleteUser()
                        }} autoFocus>
                            Delete
                        </Button>

                    </DialogActions>
                </Dialog>

            </Paper>
            }
            {!checkOwner ? <Typography variant="h3" sx={{mt: 8, color: "red"}}> Only the owner of the petition can edit it </Typography> : null}

        </div>
    )
}


export default EditPetiton;