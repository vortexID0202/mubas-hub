// This file is the entry point for the root route.
// Since we have a (app) group and an (auth) group,
// this page will be rendered within the (app) group's layout.
// We can simply re-export the page from the (app) group.
export { default } from './(app)/page';
