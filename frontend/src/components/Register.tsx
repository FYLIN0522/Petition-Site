import axios from 'axios';
import React from "react";
import Petition from "./Petition";
import {Alert, AlertTitle, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {red} from "@mui/material/colors";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";


const Register = () =>{
    const [data, setData] = React.useState<userRegister>({firstName: '',
                                                                                                            lastName: '',
                                                                                                            email: '',
                                                                                                            password: ''})
    const [image, setImage] = React.useState<File>()
    const [imageDetail, setImageDetail] = React.useState({name: '', type: ''})

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false);
    const [errors, setError] = React.useState({firstName: '',
                                                                                                                lastName: '',
                                                                                                                email: '',
                                                                                                                password: ''})
    const [finishRegister, setFinishRegister] = React.useState(false);
    const [users, setUsers] = React.useState<Array<user>>([])
    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
    const navigate = useNavigate();
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)

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
                                                password: ''};
        let valid = true;
        if(data.firstName === ''){
            error.firstName = "First name is required"
            valid = false;
        }
        if(data.lastName === ''){
            error.lastName = "Last name is required"
            valid = false;
        }
        if(!data.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
        {
            error.email += "Email is invalid"
            valid = false;
        }
        if(data.password.length < 6){
            error.password = "Password must be more than 6 characters"
            valid = false;
        }

        // users.map((u: user) => {
        //     if(data.email === u.email){
        //         error.email += "Email is already in use &"
        //         valid = false;
        //     }
        // })


        setError(error)
        return valid
    }

    const handleRegister = () => {
        console.log(checkValid())
        if(checkValid()){
            axios.post(`http://localhost:4941/api/v1/users/register`, data)
                .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")

                    if(authToken === "")
                    {
                        let loginData = {email: data.email, password: data.password}
                        console.log(loginData)
                        axios.post(`http://localhost:4941/api/v1/users/login`, loginData)
                            .then((response) => {
                                console.log((response))
                                setErrorFlag(false)
                                setErrorMessage("")
                                setUserAuthToken(response.data.token)
                                setUserId(response.data.userId)
                                setFinishRegister(true)
                                if(imageDetail.name !== '')
                                {
                                    console.log(userId)
                                    console.log((image))
                                    axios.put(`http://localhost:4941/api/v1/users/${response.data.userId}/image`, image, {headers: {'X-Authorization': response.data.token,
                                                                                                                                                    "Content-Type":   imageDetail.type}})
                                        .then((response) => {
                                            console.log((response))
                                            setErrorFlag(false)
                                            setErrorMessage("")
                                            setFinishRegister(true)
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

            }, (error) => {
                setErrorFlag(true)
                    console.log(error.toString().slice(-3))
                    if(errorMessage.slice(-3) === "403"){
                        setError({...error, email: "Email already in use"})
                    }
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


            {!finishRegister &&
                <Box sx={{display: "flex", flexDirection: "column", maxWidth: 600, gap: 1, mr: 'auto', mt: 4}}>
                    <Box sx={{display: "flex", flexDirection: "row"}}>
                        <Typography variant="h4" sx={{mr: "auto", ml: 1}}>
                            Register
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
                        label="Password"
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
                <Button type="submit" variant="contained" sx={{mr: 8, mt: 4}} onClick={handleRegister}>
                Register
                </Button>

            }

            {finishRegister &&
                <Typography variant="h3" sx={{mt: 8}}>
                    Registration success
                </Typography>
            }

        </Paper>
    )
}


export default Register;