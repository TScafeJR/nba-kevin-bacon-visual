import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

class Searchbar extends Component {
    render() {
        return (
            <div className="search-bar">
                    <InputGroup>
                        <FormControl
                            placeholder="Search"
                            aria-label="Search"
                            aria-describedby="basic-addon2"
                        />

                        <DropdownButton
                            as={InputGroup.Append}
                            variant="outline-secondary"
                            title="Search Type"
                            id="input-group-dropdown-2"
                        >
                            <Dropdown.Item href="#">Action</Dropdown.Item>
                            <Dropdown.Item href="#">Another action</Dropdown.Item>
                            <Dropdown.Item href="#">Something else here</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="#">Separated link</Dropdown.Item>
                        </DropdownButton>
                    </InputGroup>
            </div>
        );
    }
}

export default hot(module)(Searchbar);

// export const Searchbar = ({...props}) => {
//     return (
//         <div className="search-bar">
//             <InputGroup>
//                 <FormControl
//                     placeholder="Search"
//                     aria-label="Search"
//                     aria-describedby="basic-addon2"
//                 />
//
//                 <DropdownButton
//                     as={InputGroup.Append}
//                     variant="outline-secondary"
//                     title="Search Type"
//                     id="input-group-dropdown-2"
//                 >
//                     <Dropdown.Item href="#">Action</Dropdown.Item>
//                     <Dropdown.Item href="#">Another action</Dropdown.Item>
//                     <Dropdown.Item href="#">Something else here</Dropdown.Item>
//                     <Dropdown.Divider />
//                     <Dropdown.Item href="#">Separated link</Dropdown.Item>
//                 </DropdownButton>
//             </InputGroup>
//         </div>
//     );
// }
