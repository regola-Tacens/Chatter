// import React from 'react'

// export default function Login() {
//     return (
//         <div>
//             <h1>Login page</h1>
//         </div>
//     )
// }

import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'

import { gql, useLazyQuery } from '@apollo/client';

import { Link, useHistory } from 'react-router-dom'

const LOGIN_USER = gql`
  query login(
      $username: String! 
      $password:String!
    ) {
    login(
      username: $username 
      password: $password) 
      {
      username 
      email 
      createdAt
      token
     }
     }
`;

export default function Register() {
    const history = useHistory()

  const [variables, setVariables] = useState({
    username:'', 
    password:'', 
  })

  const[errors,setErrors] = useState({})

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    onError : (err) => setErrors(err.graphQLErrors[0].extensions.errors),
    onCompleted(data) {
        localStorage.setItem('token', data.login.token)
        history.push('/')
    }
  });

  const submitLoginForm =(e) => {
    e.preventDefault()
    loginUser({variables})
  
  }

  const handleChange = (e) => {
    e.preventDefault()
    setVariables({...variables, [e.target.name] : e.target.value})
    
  }
  
    return (
        <div>
            <Row className="bg-white py-5 justify-content-center">
       <Col sm={8} md={6} lg={4}>
          <h1 className="text-center">Login</h1>
          <Form onSubmit={submitLoginForm}>
            <Form.Group>  
              <Form.Label className={errors.username && 'text-danger'}>{errors.username ?? 'Username'}</Form.Label>
              <Form.Control className={errors.username && 'is-invalid' } type="text" value={variables.username} name="username"  onChange={handleChange}/>
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
              <Form.Control className={errors.password && 'is-invalid' } type="password" value={variables.password} name="password"  onChange={handleChange} />
            </Form.Group>
            <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
              { loading ? 'loading..' : 'login'}
            </Button>
            <br></br>
            <small>Don't have an account? <Link to="/register">Register</Link></small>
            </div>
          </Form>
       </Col>
     </Row>
        </div>
    )
}

