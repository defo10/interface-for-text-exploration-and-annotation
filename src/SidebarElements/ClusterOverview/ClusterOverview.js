import React from 'react';
import ClusterSnippet from './ClusterSnippet'
import ClusterTable from './ClusterTable';


/**
 * 
 * @param comments is the subset of the data which has label @param label
 * @param label is the label of said comments
 */
export default function ClusterOverview({ data, labels, ...other }) {
    const labelSet = new Set()
    for (let element of labels) {
        labelSet.add(element.label_kmedoids)
    }

    return (
        <ClusterTable
            labels={labels}
            data={data}
        />
    )

    /*
    return (
        <div>
            {Array.from(labelSet.entries(), ([key,_]) => (
                <ClusterSnippet
                    label={key}
                    labels={labels}
                    data={data}
                />))
            }
        </div>
    )*/
}