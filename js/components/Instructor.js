import React from 'react';
import Relay from 'react-relay';

class Instructor extends React.Component {
  render() {
    return (
      <div>
      <tr>{this.props.instructor.firstName}</tr>
      <tr>{this.props.instructor.lastName}</tr>
      <tr>{this.props.instructor.age}</tr>
      <tr>{this.props.instructor.gender}</tr>
      </div>
    );
  }
}

export default Relay.createContainer(Instructor, {
  fragments: {
    instructor: () => Relay.QL`
      fragment on Instructor {
        id,
        firstName,
        lastName,
        age,
        gender
      }
    `,
  },
});
