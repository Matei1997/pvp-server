import { FC, useState } from "react";
import style from "./auth.module.scss";
import { AuthForm } from "./components/AuthForm";
import { RegisterForm } from "./components/RegisterForm";
import { createComponent } from "src/hoc/registerComponent";

const Authentication: FC = () => {
    const [form, setForm] = useState("auth");
    return (
        <div className={style.main}>
            <div className={style.authLayout}>
                <div className={style.leftCol}>
                    <div className={style.welcome}>
                        <div className={style.welcomeTitle}>ARENA</div>
                        <div className={style.welcomeSubtitle}>SIGN IN TO ENTER THE HIDEOUT</div>
                        <p className={style.welcomeText}>Log in to queue for hop outs, customize your loadout, and track your stats.</p>
                    </div>
                    {form === "auth" ? <AuthForm setForm={setForm} /> : <RegisterForm setForm={setForm} />}
                </div>

                <aside className={style.rightCol}>
                    <div className={style.profileCard}>
                        <div className={style.profileTitle}>YOUR PROFILE</div>
                        <div className={style.profileName}>Guest</div>
                        <div className={style.profileRank}>UNRANKED</div>
                        <div className={style.profileStats}>
                            <div>LEVEL 1</div>
                            <div>0 / 500 XP</div>
                        </div>
                        <div className={style.profileFooter}>Connect to see your badges and lobby.</div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default createComponent({
    props: {},
    component: Authentication,
    pageName: "auth"
});
