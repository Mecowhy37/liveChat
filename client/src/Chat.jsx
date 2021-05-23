import React from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, useSubscription, useMutation, gql } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';

const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnet: true,
    }
})

const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
})

const GET_MESSAGES = gql`
subscription {
  messages {
    id
    content
    user
  }
}
`;

const POST_MESSAGE = gql`
mutation ($user:String!, $content:String!) {
    postMessage(user:$user, content:$content)
}
`

const Messages = ({user}) => {
    const { data } = useSubscription(GET_MESSAGES);
    if (!data){
        return null;
    }

    return (
        <>
            {data.messages.map(({id, user: messageUser, content}) => (
                <div style={{display: 'flex',
                justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
                paddingBottom: '1em',}} key={id}>
                    {user !== messageUser && (
                        <div style={{
                            heigth: 50,
                            width: 50,
                            marginRight: '0.5em',
                            border: '2px solid',
                            borderRadius: 25,
                            textAlign: 'center',
                            fontSize: '18pt', 
                            paddingTop: 10,
                        }}>
                            {messageUser.slice(0,2).toUpperCase()}
                        </div>
                    )}
                    <div style={{
                        backgroundColor: user === messageUser ? '#58bf56' : '#e5e6ea',
                        color: user === messageUser ? 'white' : 'black',
                        padding: '1em',
                        borderRadius: '1em',
                        maxWidth: '60%',
                    }}>
                        {content}
                    </div>
            </div>
            ))}
        </>
    )
}

const Chat = () => {
    const  [state, setState] = React.useState({
        user: 'Jack',
        content: "",
    })
    const [postMessage] = useMutation(POST_MESSAGE);
    const onSend = () => {
        if (state.content.length > 0){
            postMessage({
                variables: state,
            })
        }
        setState({
            ...state,
            content:'',
        })
    }

    return <div>
        <Messages user={state.user}/>
        <div style={{width: '100%',
         display: 'grid',
         gridTemplateColumns: '1fr 4fr 1fr',
        }}>
            <div style={{
                gridColumn: '1/2',
                width: 100,
            }}>
                <input type="text" name="mess" id="name" placeholder="Name" value={state.user} onChange={(evt) => setState({...state, user: evt.target.value})}/>
            </div>
            <div style={{
                gridColumn: '2/3',
                width: 100,
            }}>
                <input type="text" name="mess" id="mess" placeholder="Message" value={state.content} onChange={(evt) => setState({...state, content: evt.target.value})}/>
            </div>
            <div style={{
                gridColumn: '3/4',
                width: 100,
            }}>
                <button onClick={() => onSend()}>send</button>
            </div>
        </div>
    
    </div>;
};

const ChatWindow = () => (
    <ApolloProvider client={client}>
        <Chat/>
    </ApolloProvider>
)

export default ChatWindow;