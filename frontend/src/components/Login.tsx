import axios from 'axios';
import React from "react";
import {Link, useNavigate, useParams } from "react-router-dom";

import {
    Alert, AlertTitle, Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, IconButton, InputAdornment, Snackbar,
    TextField, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useLoginDetailStore} from "../store/loginDetails";
import {Visibility, VisibilityOff} from "@mui/icons-material";

const Login = () => {
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false);

    const handleEmailEnter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordEnter = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };
    const passwordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = () => {
        if(authToken === "") {
            let data = {email, password}
            console.log(data)
            axios.post(`http://localhost:4941/api/v1/users/login`, data)
                .then((response) => {
                    console.log((response.data.token))
                    setErrorFlag(false)
                    setErrorMessage("")
                    setUserAuthToken(response.data.token)
                    setUserId(response.data.userId)
                    navigate(`/`);
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



                <Box sx={{display: "flex", flexDirection: "column", maxWidth: 400, gap: 4, mx: "auto", mt: 40}}>
                    <Typography variant="h5" sx={{mt: 4}}>
                        Sign up
                    </Typography>

                    <TextField
                        label="Email"
                        value={email}
                        onChange={handleEmailEnter}
                        FormHelperTextProps={{sx: {color: "red"}}}
                    />
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordEnter}
                        helperText={errorFlag ? "Invalid email or password" : ""}
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

                {authToken !== "" ? <Typography variant="h6" sx={{mt: 0, color: "red"}}> You already logged in </Typography> : null}

                <Button type="submit" variant="outlined" sx={{ mt: 4}} onClick={handleLogin}>
                    Log in
                </Button>
                <Box sx={{ mx: "auto", mt: 4}}>
                    <Link to={"/"} >Back to petitions page</Link>
                </Box>
        </div>
    )




}

export default Login;