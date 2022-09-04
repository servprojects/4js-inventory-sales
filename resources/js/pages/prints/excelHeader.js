import React, { Component, useRef } from 'react';

class ExHead extends React.Component {



    render() {

        return (
            <>
                <tr>
                    <td colSpan={this.props.colspan}>
                        <center>
                            4J'S BUILDERS AND CONSTRUCTION SUPPLY<br />
                                        VILLALIMPIA, LOAY, BOHOL
                                        <br />
                                        <br />
                                        HARDWARE SUMMARY REPORT<br />
                                       <b> {this.props.title}</b>
                                       {
                                           this.props.range? 
                                           <>
                                           <br/>As Of {this.props.range}
                                           </>
                                           : this.props.rangeSR ?
                                           <>
                                           <br/>{this.props.rangeSR}
                                           </>
                                           :
                                           
                                           <></>                                       
                                           }
                        </center>
                    </td>
                </tr>
            </>
        );
    }
}
export default ExHead;