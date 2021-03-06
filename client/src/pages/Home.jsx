import React from 'react'
import { Row, Col, Button, Image } from 'react-bootstrap'
import { Link, useHistory } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'

import { useAuthDispatch } from '../context/auth'

const GET_USERS=gql`
    query getUsers{
        getUsers {
        username 
        createdAt 
        imageUrl 
        latestMessage{
            uuid
            from
            to 
            content
            }
        }
    }
`

export default function Home() {
    const history = useHistory()
    const dispatch =useAuthDispatch()

    const logout = ()=> {
        dispatch ( { type: 'LOGOUT'})
        history.push('/login')

    }

    const { loading, data, error} = useQuery(GET_USERS)


    if(error){
        console.log(error)
    }
    if(data){
        console.log(data)
    }

    let usersMarkup
    if(!data || loading) {
        usersMarkup= <p>Loading..</p>
    } else if(data.getUsers.length === 0) {
        usersMarkup= <p>No users have joined yet</p>
    } else if(data.getUsers.length > 0) {
        usersMarkup= data.getUsers.map(user => (
            <div className="d-flex p-3" key={user.username}>
                <Image src={user.imageUrl} roundedCircle className="mr-2"
                    style={{ width: 50, height: 50, objectFit: 'cover'}}
                />
                <div>
                    <p className="text-success">{user.username}</p>
                    <p className="font-weight-light">
                        {user.latestMessage ? user.latestMessage.content : 'You are now connected!'}
                    </p>

                </div>
            </div>
        ))
    }

    return (
        <>
            <Row className="bg-white justify-content-around mb-1">
                <Link to="/login">
                    <Button variant="link">
                        Login
                    </Button>
                </Link>
                <Link to="/register">
                    <Button variant="link">
                        Register
                    </Button>
                </Link>
                    <Button variant="link" onClick={ logout }>
                        Logout
                    </Button>
            </Row>
            <Row className="bg-white">
                <Col xs={4} className="p-0 bg-secondary">
                    {usersMarkup}
                </Col>
                <Col xs={8}>
                    <p>Messages</p>
                </Col>

            </Row>
        </>
    )
}
