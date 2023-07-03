#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CommonStack } from '../lib/common-stack';
import { ManagementServiceStack } from '../lib/management-service-stack';
import { DeliveryServiceStack } from '../lib/delivery-service-stack';


const app = new cdk.App();

const commonStack = new CommonStack(app, 'ahcms-common', {});


new ManagementServiceStack(app, 'ahcms-management', {
  projectTable: commonStack.projectTable,
  userTable: commonStack.userTable,
  modelTable: commonStack.modelTable,
  contentTable: commonStack.contentTable,
  managementToolUserPool: commonStack.managementToolUserPool
});


new DeliveryServiceStack(app, 'ahcms-delivery', {})