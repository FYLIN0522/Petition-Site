import axios from 'axios';
import React from "react";
import {Alert, AlertTitle, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {red} from "@mui/material/colors";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";


const EditProfile = () =>{
    const [data, setData] = React.useState<userPatch>({firstName: '',
        lastName: '',
        email: '',
        password: '',
        currentPassword: ''})
    const [image, setImage] = React.useState<File>()
    const [imageDetail, setImageDetail] = React.useState({name: '', type: ''})

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false);
    const [errors, setError] = React.useState({firstName: '',
        lastName: '',
        email: '',
        password: '',
        currentPassword: ''})
    const [finishRegister, setFinishRegister] = React.useState(false);
    const [users, setUsers] = React.useState<Array<user>>([])
    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
    const navigate = useNavigate();
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)
    const [buttonClick, setButtonClick] = React.useState(false);
    const [valid, setValid] = React.useState(false);

    React.useEffect(() => {
        const getUsers =  () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}`, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    // console.log(petition);
                    // console.log(petition.supportTiers);
                    setErrorFlag(false)
                    setErrorMessage("")
                    //etData(response.data)
                    setData(data => ({...data, firstName:response.data.firstName}))
                    setData(data => ({...data, lastName:response.data.lastName}))
                    setData(data => ({...data, email:response.data.email}))
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getUsers();
    }, [])

    React.useEffect(() => {
        const getImage =  () => {
            axios.get(`http://localhost:4941/api/v1/users/${userId}/image`)
                .then((response) => {
                    // console.log(petition.supportTiers);
                    setErrorFlag(false)
                    setErrorMessage("")
                    //setImage(response.data)
                    //setImageDetail

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })
        }
        getImage();
    }, [])
    const passwordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handleFNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, firstName: event.target.value});
    };
    const handleLNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, lastName: event.target.value});
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, email: event.target.value});
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, password: event.target.value});
    };
    const handleCurrPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setData({...data, currentPassword: event.target.value});
    };

    const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file){
            setImage(file)
            setImageDetail({name: file.name, type: file.type})
        }
    };

    const checkValid = () => {
        let error = {firstName: '',
            lastName: '',
            email: '',
            password: '',
            currentPassword: ''};
        let valid = true;
        if(data.firstName === ''){
            error.firstName = "First name is required"
            valid = false;
        }
        if(data.lastName === ''){
            error.lastName = "Last name is required"
            valid = false;
        }

        if(data.email !=='' && !data.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
        {
            error.email += "Email is invalid"
            valid = false;
        }
        if(data.password.length < 6){
            error.password = "Password must be more than 6 characters"
            valid = false;
        }
        setValid(valid)
        // if(data.password === data.currentPassword){
        //     error.password = "Password must not be the same"
        //     valid = false;
        // }
        // users.map((u: user) => {
        //     if(data.email === u.email){
        //         error.email += "Email is already in use &"
        //         valid = false;
        //     }
        // })

        setError(error)
        return valid
    }

    const handleEdit = () => {
        setButtonClick(true)
        console.log(checkValid())
        if(checkValid()){
            axios.patch(`http://localhost:4941/api/v1/users/${userId}`, data, {headers: {'X-Authorization': authToken}})
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")

                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                })


            if(imageDetail.name !== '')
            {
                console.log(userId)
                console.log((image))
                axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, image, {headers: {'X-Authorization': authToken,
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
                <Link to={"/myPetiton"} >Back to my petiton page</Link>
            </Box>

            {!finishRegister &&
                <Box sx={{display: "flex", flexDirection: "column", maxWidth: 600, gap: 1, mr: 'auto', mt: 4}}>
                    <Box sx={{display: "flex", flexDirection: "row"}}>
                        <Typography variant="h4" sx={{mr: "auto", ml: 1}}>
                            Edit Profile
                        </Typography>

                        <Button  sx={{mt: 1,}}
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
                    {/*<Button type="submit" variant="text" sx={{ml:"auto", color:"red"}} onClick={handleEdit}>*/}
                    {/*    Delete photo*/}
                    {/*</Button>*/}

                    {imageDetail.name !== '' ?  <Typography sx={{ml:"auto", fontSize: 14}}> image: {imageDetail.name} </Typography> : null}
                    <TextField sx={{mt:4}}
                               label="First name "
                               type="string"
                               value={data.firstName}
                               onChange={handleFNameChange}
                               helperText={errors.firstName}
                               FormHelperTextProps={{sx: {color: "red"}}}

                    />
                    <TextField sx={{mt:4}}
                               label="Last name "
                               type="string"
                               value={data.lastName}
                               onChange={handleLNameChange}
                               helperText={errors.lastName}
                               FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField sx={{mt:4}}
                               label="Email"
                               value={data.email}
                               onChange={handleEmailChange}
                               helperText={errors.email}
                               FormHelperTextProps={{sx: {color: "red"}}}
                    />

                    <TextField sx={{mt:4}}
                               label="Current Password"
                               type={showPassword ? "text" : "password"}
                               value={data.currentPassword}
                               onChange={handleCurrPassword}
                               helperText={errors.password}
                               FormHelperTextProps={{sx: {color: "red"}}}
                               InputProps={{
                                   endAdornment: (
                                       <InputAdornment position="end">
                                           <IconButton
                                               aria-label="toggle password visibility"
                                               onClick={passwordVisibility}
                                           >
                                               {showPassword ? <Visibility /> : <VisibilityOff />}
                                           </IconButton>
                                       </InputAdornment>
                                   )
                               }}
                    />
                    <TextField sx={{mt:4}}
                               label="New Password"
                               type={showPassword ? "text" : "password"}
                               value={data.password}
                               onChange={handlePasswordChange}
                               helperText={errors.password}
                               FormHelperTextProps={{sx: {color: "red"}}}
                               InputProps={{
                                   endAdornment: (
                                       <InputAdornment position="end">
                                           <IconButton
                                               aria-label="toggle password visibility"
                                               onClick={passwordVisibility}
                                           >
                                               {showPassword ? <Visibility /> : <VisibilityOff />}
                                           </IconButton>
                                       </InputAdornment>
                                   )
                               }}
                    />


                </Box>
            }



            {!finishRegister &&
                <Button type="submit" variant="contained" sx={{mr: 8, mt: 4}} onClick={handleEdit}>
                    Edit
                </Button>

            }
            { errorMessage.slice(-3) === "401" ? <Typography variant="h6" sx={{mt: 0, color: "red"}}> Incorrect current password</Typography> : null}
            { errorMessage.slice(-3) === "403" ? <Typography variant="h5" sx={{mt: 8, color: "red"}}> Email is already in use / Identical current and new passwords</Typography> : null}
            { errorMessage === "" && buttonClick && valid ? <Typography variant="h5" sx={{mt: 4, color: "blue"}}> Success </Typography> : null}
            {finishRegister &&
                <Typography variant="h3" sx={{mt: 8}}>
                    Edit success
                </Typography>
            }

        </Paper>
    )
}


export default EditProfile;