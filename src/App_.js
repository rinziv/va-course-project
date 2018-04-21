import React, { Component } from 'react'
import './App.css'
import SimpleForm from './components/SimpleForm'
import TediousForm from './components/TediousForm'
import FormikForm from './components/FormikForm'

import { Navbar, Jumbotron, Button } from 'react-bootstrap';

class App extends Component {
    state = {
        formType: 'formik',
    }

    handleChangeForm = formType => {
        console.log(formType)
        this.setState((prevState, props) => ({
            formType,
        }))
    }

    render() {
        const { formType } = this.state

        // this will do in a pinch, but should really be a router instead
        let form = null
        switch (formType) {
            case 'simple':
                form = <SimpleForm />
                break
            case 'tedious':
                form = <TediousForm />
                break
            case 'formik':
                form = <FormikForm />
                break

            default:
        }

        return (
            <div className="App">
                <header className="App-header">
                    <div className="logoContainer">

                        <span className="heart">❤</span>
                    </div>
                    <h1 className="App-title">The Joy of Forms with React and Formik</h1>
                    <div>
            <span
                className="form-link"
                onClick={() => this.handleChangeForm('simple')}
            >
              Simple
            </span>
                        <span
                            className="form-link"
                            onClick={() => this.handleChangeForm('tedious')}
                        >
              Tedious
            </span>
                        <span
                            className="form-link"
                            onClick={() => this.handleChangeForm('formik')}
                        >
              Formik
            </span>
                    </div>
                </header>
                <div className="formContainer">{form}</div>
            </div>
        )
    }
}

export default App