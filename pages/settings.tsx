import Link from 'next/link';
import { useRef, useState } from 'react';
import userbase from 'userbase-js';
function Index({ user }) {
    const [isSaving, setIsSaving] = useState(false);
    const oldPassRef = useRef<HTMLInputElement>();
    const newPassRef = useRef<HTMLInputElement>();
    console.log(user);
    const onSave = () => {
        userbase.updateUser({
            username: user.username,
            currentPassword: oldPassRef.current.value,
            newPassword: newPassRef.current.value,
            email: user.username,
          }).then(() => {
            // user account updated
          }).catch((e) => console.error(e))
    }
	if (user) {
		return (
			<div className="w-4/5 md:w-1/2 mx-auto">
				<h1 className="font-bold text-4xl">
					Welcome,{' '}
					<span className="bg-yellow-400">{user.username}</span>!
				</h1>
                <h2>Edit Password</h2>
                <form onSubmit={() => onSave()}>
                <div>
                    <label htmlFor={'old-password'}>
                        Old Password
                    </label>
                    <input id={'old-password'} type={'password'} />
                </div>
                <div>
                    <label htmlFor={'new-password'}>
                        New Password
                    </label>
                    <input id={'new-password'} type={'password'} />
                    </div>
                    <button className={"btn-yellow"}
                        onClick={() => onSave()} type={'submit'}>Save</button>
                </form>
                
			</div>
		);
	} else {
		return null;
	}
}

export default Index;
