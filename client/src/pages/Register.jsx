import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'

import { gql, useMutation } from '@apollo/client';

import { Link, useHistory } from 'react-router-dom'

const REGISTER_USER = gql`
  mutation register($username: String! $email: String! $password:String! $confirmPassword:String!) {
    register(username: $username email: $email password: $password confirmPassword: $confirmPassword) {
      username email createdAt
    }
  }
`;

export default function Register() {

  const history = useHistory()

  const [variables, setVariables] = useState({
    email:'', 
    username:'', 
    password:'', 
    confirmPassword:'', 
  })

  const[errors,setErrors] = useState({})

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update : (_, __,) =>  history.push('/login'),
    onError : (err) => setErrors(err.graphQLErrors[0].extensions.errors)
  });

  const submitRegisterForm =(e) => {
    e.preventDefault()
    registerUser({variables})
  
  }

  const handleChange = (e) => {
    e.preventDefault()
    setVariables({...variables, [e.target.name] : e.target.value})
    
  }
  
    return (
        <div>
            <Row className="bg-white py-5 justify-content-center">
       <Col sm={8} md={6} lg={4}>
          <h1 className="text-center">Register</h1>
          <Form onSubmit={submitRegisterForm}>
            <Form.Group>
              <Form.Label className={errors.email && 'text-danger'}>{errors.email ?? 'EMail address'}</Form.Label>
              <Form.Control className={errors.email && 'is-invalid' } type="email" value={variables.email} name="email"  onChange={handleChange}/>
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.username && 'text-danger'}>{errors.username ?? 'Username'}</Form.Label>
              <Form.Control className={errors.username && 'is-invalid' } type="text" value={variables.username} name="username"  onChange={handleChange}/>
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.password && 'text-danger'}>{errors.password ?? 'Password'}</Form.Label>
              <Form.Control className={errors.password && 'is-invalid' } type="password" value={variables.password} name="password"  onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label className={errors.confirmPassword && 'text-danger'}>{errors.confirmPassword ?? 'Confirm password'}</Form.Label>
              <Form.Control className={errors.confirmPassword && 'is-invalid' } type="password" value={variables.confirmPassword} name="confirmPassword"  onChange={handleChange} />
            </Form.Group>
            <div className="text-center">
            <Button variant="success" type="submit" disabled={loading}>
              { loading ? 'loading..' : 'register'}
            </Button>
            <br></br>
            <small>Already have an account? <Link to="/login">Login</Link></small>
            </div>
          </Form>
       </Col>
     </Row>
        </div>
    )
}
