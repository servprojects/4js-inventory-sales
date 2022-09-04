import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import BasePub from '../BasePub';

const PublicRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <BasePub>
        <Component {...props} />
      </BasePub>
    )}
  />
);

PublicRoute.propTypes = {};

export default PublicRoute;
