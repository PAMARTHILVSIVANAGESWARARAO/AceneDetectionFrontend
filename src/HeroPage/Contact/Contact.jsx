import React, { useEffect, useRef } from "react"
import { useForm, ValidationError } from "@formspree/react"
import { animate } from "animejs"
import toast, { Toaster } from "react-hot-toast"
import ParticlesBg from "./ParticlesBg"
import "./Particle.css"
const Contact = () => {
  const [state, handleSubmit] = useForm("xojnoryk")
  const formRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    if (leftRef.current) {
      animate(leftRef.current, {
        translateX: [-80, 0],
        opacity: [0, 1],
        duration: 900,
        easing: "easeOutExpo",
      })
    }

    if (rightRef.current) {
      animate(rightRef.current, {
        translateX: [80, 0],
        opacity: [0, 1],
        duration: 900,
        delay: 200,
        easing: "easeOutExpo",
      })
    }
  }, [])

  useEffect(() => {
    if (state.succeeded) {
      toast.success("Thank you for contacting us!", {
        style: {
          background: "linear-gradient(135deg,#0f766e,#14b8a6)",
          color: "#fff",
        },
      })
      formRef.current?.reset()
    }

    if (state.errors && state.errors.length > 0) {
      toast.error("Something went wrong. Please try again.", {
        style: {
          background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
          color: "#fff",
        },
      })
    }
  }, [state])

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <ParticlesBg id="particles"/>
      <Toaster position="top-right" />

      <div className="relative z-10 w-full max-w-6xl px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* LEFT SIDE */}
          <div
            ref={leftRef}
            className="w-full lg:w-1/2 space-y-6"
            style={{ opacity: 0 }}
          >
            <h1
              className="text-4xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg,#0f766e,#14b8a6,#0ea5e9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              We Are Behind The Code
            </h1>

            <p className="text-slate-600">
              We are Waiting To Hear From You. Whether you have questions, feedback, or just want to say hello, feel free to reach out to us. We value your input and look forward to connecting with you!
            </p>

            <div className="space-y-4">
              {["Archana", "Bhavana", "Valli", "Vyshnavi", "Siva nagu"].map(
                (dev, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 border border-teal-200 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-600 to-sky-500 text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-700 home-name">
                      {dev}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div
            ref={rightRef}
            className="w-full lg:w-1/2"
            style={{ opacity: 0 }}
          >
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl border border-teal-200 shadow-lg">

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                <h1
              className="text-2xl font-bold"
              style={{
                background:
                  "linear-gradient(135deg,#0f766e,#14b8a6,#0ea5e9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Contact Us By This Form
            </h1>
                <div>
                  <label className="text-sm font-medium text-teal-700">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>

                <div>
                  <label className="text-sm font-medium text-teal-700">
                    What We Call You
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-teal-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-teal-700">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    className="w-full mt-2 px-4 py-3 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} />
                </div>

                <button
                  type="submit"
                  disabled={state.submitting}
                  className={`
                    w-full py-3 rounded-xl text-white font-semibold
                    flex items-center justify-center gap-3
                    transition-all duration-300
                    ${state.submitting 
                      ? "bg-teal-500 cursor-not-allowed opacity-80" 
                      : "bg-linear-to-r from-teal-700 via-teal-500 to-sky-500 hover:scale-[1.02] cursor-pointer"}
                  `}
                >
                  {state.submitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            opacity: 0.5,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: i === 2 ? 24 : 6,
                height: 6,
                borderRadius: 999,
                background: "#004C4C",
                transition: "width 0.3s",
              }}
            />
          ))}
        </div>
      </div>
      
    </div>
  )
}

export default Contact