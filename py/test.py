#%%
import math

import matplotlib.pyplot as plt
import numpy as np
import scipy.integrate as integrate

# %%
n_points = 100
rotation_range = 2 * math.pi
theta = np.linspace(0, rotation_range, n_points)
r = 1 + np.sin(theta)

plt.plot(theta, np.ones(len(theta)), label="r=1")
plt.plot(theta, r, label="r=1+sin(theta)")
plt.gca().set_aspect("equal")
plt.title("Radius")
plt.xlabel("Theta")
plt.ylabel("Radius")
plt.legend()
plt.show()

_, ax = plt.subplots(subplot_kw={"projection": "polar"})
ax.plot(theta, r)
ax.grid(True)
ax.set_rlabel_position(-22.5)  # Move radial labels away from plotted line
ax.set_title("Shape", va="bottom")
# ax.set_rmax(max(r))

# if constant radius r = 1
ax.plot(theta, len(theta) * [1], label="r=1", color="r")
# plt.plot(1 * np.cos(theta), 1 * np.sin(theta), label="r=1")

# r = sin(theta)
ax.plot(theta, np.sin(theta), label="r=sin(theta)", color="g")

# r = 1 + sin(theta)
ax.plot(theta, 1 + np.sin(theta), label="r=1+sin(theta)", color="b")
# computed x and y
# plt.plot(r * np.cos(theta), r * np.sin(theta), label="r=1+sin(theta)")

# r = 1 + sin(theta) solved for x,y
# plt.plot(
#     np.cos(theta) + np.cos(theta) * np.sin(theta),
#     np.sin(theta) + np.square(np.sin(theta)),
#     label="r=1 + sin(theta) eqn",
# )
# plt.gca().set_aspect("equal")
# plt.title("Shape")
# plt.xlabel("x")
# plt.ylabel("y")
plt.legend()
plt.show()


plt.plot(
    theta,
    [integrate.quad(lambda x: 1, 0, ang)[0] for ang in theta],
    label="r=1",
    color="r",
)
plt.plot(
    theta,
    [integrate.quad(lambda x: math.sin(x), 0, ang)[0] for ang in theta],
    label="r=sin(theta)",
    color="g",
)
plt.plot(
    theta,
    [integrate.quad(lambda x: 1 + math.sin(x), 0, ang)[0] for ang in theta],
    label="r=1+sin(theta)",
    color="b",
)
plt.title("Circumference")
plt.xlabel("theta")
plt.ylabel("circumference")
plt.legend()
plt.gca().set_aspect("equal")
plt.show()

# https://proofwiki.org/wiki/Parametric_Equation_of_Involute_of_Circle
# x = np.cos(theta)+theta*np.sin(theta)
# y = np.sin(theta)+theta*np.cos(theta)
# plt.plot(x,y)
# plt.gca().set_aspect('equal')
# plt.show()
# %%

n_points = 100
frequency_hz = 1
period_sec = 1 / frequency_hz
b = (2 * math.pi) / period_sec
amplitude = 1

phase_shift = 0  # seconds

x = np.linspace(0, period_sec, n_points)
y = amplitude * np.sin(b * x + phase_shift)
plt.plot(x, y)
plt.grid(True)
plt.xlim(-period_sec / 2, 2 * period_sec)
plt.show()


# %%
