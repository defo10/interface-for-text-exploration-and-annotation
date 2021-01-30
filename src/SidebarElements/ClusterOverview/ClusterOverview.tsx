import React from 'react';
import ClusterSnippet from './ClusterSnippet'
import ClusterTable from './ClusterTable';
import { PropsForSidebar } from '../../Sidebar';


export type PropsForClusterOverview = PropsForSidebar

/**
 * 
 * @param comments is the subset of the data which has label @param label
 * @param label is the label of said comments
 */
export default function ClusterOverview(props:PropsForClusterOverview) {
    return (
        <ClusterTable {...props}/>
    )
}