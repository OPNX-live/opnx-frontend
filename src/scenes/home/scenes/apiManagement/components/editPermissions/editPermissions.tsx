import React, { Component } from 'react';
import { connect } from 'react-redux';
import './editPermissions.scss';

type IEditPermissionsPropsState = ReturnType<typeof mapStateToProps>;
type IEditPermissionsDispatchState = ReturnType<typeof mapDispatchToProps>;

class EditPermissions extends Component {
  render() {
    return <div>EditPermissions</div>;
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPermissions);
