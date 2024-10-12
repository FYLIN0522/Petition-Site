import React from "react";
import axios from "axios";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    FormControl,
    InputLabel, MenuItem, Pagination,
    Paper,
    Select, SelectChangeEvent, Stack,
    TextField,
    Typography
} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import CSS from "csstype";
import PetitionListObject from "./PetitionsListObject";
import {Category} from "@mui/icons-material";
import {useLoginDetailStore} from "../store/loginDetails";


function Petitions() {
    const pageSize = 10;
    const [searchString, setSearch] = React.useState('');
    const [q, setQ] = React.useState('');
    //const [searchResults, setResults] = React.useState<Array<PetitionFull>>([]);
    //const [petitionFull, setPetitionsFull] = React.useState<Array<PetitionFull>>([]);
    const [petitions, setPetitions] = React.useState<Array<PetitionFull>>([]);
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [searchCategory, setSearchCate] = React.useState('');
    const [categories, setCategory] = React.useState<Array<Category>>([]);

    const [maxCost, setMaxCost] = React.useState<number>();
    const [sortOrder, setSortOrder] = React.useState('CREATED_ASC');

    const [currentPage, setCurrentPage] = React.useState(1);
    let totalPages = Math.ceil(petitions.length / pageSize);

    const authToken = useLoginDetailStore(state => state.authToken)
    const setUserAuthToken = useLoginDetailStore(state => state.setUserAuthToken)
    const navigate = useNavigate();
    let startIndex = (currentPage - 1) * pageSize;
    let selectedPetitions = petitions.slice(startIndex, startIndex + pageSize)
    const userId = useLoginDetailStore(state => state.userId)
    const setUserId = useLoginDetailStore(state => state.setUserId)

    React.useEffect(() => {
        const getPetitions = () => {
            axios.get('http://localhost:4941/api/v1/petitions')
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setPetitions(response.data.petitions);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        }
        getPetitions();
        setCurrentPage(1);
        startIndex = (currentPage - 1) * pageSize;
        selectedPetitions = petitions.slice(startIndex, startIndex + pageSize);
    }, [setPetitions]);


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
        setCurrentPage(1);
        startIndex = (currentPage - 1) * pageSize;
        selectedPetitions = petitions.slice(startIndex, startIndex + pageSize);
    }, [setCategory]);

    React.useEffect(() => {
        handleSearch()

    }, [searchCategory, maxCost, sortOrder, q]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        setSearchCate(event.target.value) ;
        console.log(searchCategory);
    };

    const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const cost = parseInt(event.target.value, 10);
        setMaxCost(cost);
    };

    const handleSearchSubmit = () => {
        setQ(searchString)
    };

    const handleSearch = () => {
        //event.preventDefault();
        let url = `http://localhost:4941/api/v1/petitions?q=${q}&`;
        if (q === '') {
            url = `http://localhost:4941/api/v1/petitions?`;
        }
        categories.map((category : Category) => {
            if(category.name === searchCategory){
                url += `categoryIds=${category.categoryId}&`;
            }
        })
        console.log(maxCost)
        if (maxCost !== undefined && maxCost >= 0){
            url += `supportingCost=${maxCost}&`
        }

        url += `sortBy=${sortOrder}`
        // console.log(maxCost);
        // console.log(url);

        axios.get(url)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data.petitions);
                console.log(response.data.petitions);

            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })

        setCurrentPage(1);
        startIndex = (currentPage - 1) * pageSize;
        selectedPetitions = petitions.slice(startIndex, startIndex + pageSize);
    };



    const petition_rows = () => selectedPetitions.map((petition: Petition) => <PetitionListObject key={petition.petitionId + petition.title} petition={petition}/>);

    const handleChange = (_event: unknown, page:number) => {
        setCurrentPage(page);
    };

    const handleSelectOrder = (event: SelectChangeEvent<string>) => {
        setSortOrder(event.target.value) ;
        console.log(searchCategory);
    };

    const logOut = () => {
        console.log(authToken)

        axios.post('http://localhost:4941/api/v1/users/logout', {}, {headers: {'X-Authorization': authToken}})
            .then((response) => {
                console.log(response)
                setErrorFlag(false);
                setErrorMessage("");
                setUserAuthToken("")
                setUserId(-1)
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });

    };

    const createPage = () => {
        navigate(`/create`);
    };

    return (
        <Paper elevation={3} sx={{boxShadow: "none", p: 2, maxWidth: 1200, mx: "auto"}}>
            {errorFlag && (
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            )}

            {(authToken === "") && (
                < Box sx={{display: "flex", justifyContent: "flex-end",  mt: 1, gap: 3, fontSize: 20}}>
                    <Link to={"/register"} >Register</Link> <Link to={"/login"}>Log in</Link>
                </Box>
            )}

            {(authToken !== "") && (
                < Box sx={{display: "flex", justifyContent: "flex-end",  mt: 1, gap: 3, fontSize: 20}}>
                    <Typography variant="h6" sx={{ml: "auto"}}>
                        Welcome
                    </Typography>
                    <Link to={"/myPetiton"} >My Petitons</Link>
                    <Button type="submit" variant="text"  onClick={createPage}>
                        Create petition
                    </Button>
                    <Button type="submit" variant="text"  onClick={logOut}>
                        Logout
                    </Button>
                </Box>
            )}

            <Typography variant="h4" sx={{mt: 4}}>Petition Search</Typography>


            <Box sx={{display: "flex", justifyContent: "space-between", mb: 4, mt: 4}}>
                <TextField
                    fullWidth
                    label="Search petitions..."
                    variant="outlined"
                    value={searchString}
                    onChange={handleSearchChange}

                />
                <Button variant="contained" onClick={handleSearchSubmit} sx={{ml: 2}}>Search</Button>
            </Box>


            <Box sx={{display: "flex", gap: 2, mb: 2}}>
                <FormControl fullWidth>
                    <InputLabel id="categoryLabel">Category: any</InputLabel>
                    <Select
                        labelId="categoryLabel"
                        label="Category: any"
                        value={searchCategory}
                        onChange={handleCategoryChange}
                    >
                        <MenuItem value="">Category: any</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat.categoryId} value={cat.name}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="Max Supporting Cost"
                    type="number"
                    value={maxCost}
                    inputProps={{ min: 0 }}
                    onChange={handleCostChange}
                />

                <FormControl fullWidth>
                    <InputLabel id="sortLabel">sort</InputLabel>
                    <Select
                        labelId="sortLabel"
                        value={sortOrder}
                        label="sort"
                        onChange={handleSelectOrder}
                    >
                        <MenuItem value="CREATED_ASC">Chronologically by creation date</MenuItem>
                        <MenuItem value="CREATED_DESC">Reverse Chronologically by creation date</MenuItem>
                        <MenuItem value="ALPHABETICAL_ASC">Ascending alphabetically</MenuItem>
                        <MenuItem value="ALPHABETICAL_DESC">Descending alphabetically</MenuItem>
                        <MenuItem value="COST_ASC">Ascending by supporting cost</MenuItem>
                        <MenuItem value="COST_DESC">Descending by supporting cost</MenuItem>
                    </Select>
                </FormControl>

                {/*<Button variant="contained" sx={{ml: 2}} onClick={handleApplyFilter}>Apply Filter</Button>*/}
            </Box>


            {petition_rows()}

            <Stack spacing={2} sx={{ alignItems: "center" }}>
                <Pagination variant="outlined"
                    count={totalPages}
                    page={currentPage}
                    onChange={handleChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                />
            </Stack>
        </Paper>
    );
}

export default Petitions;
